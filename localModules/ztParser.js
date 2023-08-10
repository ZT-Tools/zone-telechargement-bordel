/**
 * @name ztParser
 * @author Sylicium
 * @date 09/08/2023
 * @version 1.6.0
 * @github https://github.com/Sylicium/zone-telechargement-api/
 */

const axios = require("axios")
const cheerio = require("cheerio");
require('dotenv').config();

const moviesDb = process.env.MOVIESDB_API_KEY;

var somef = require('./someFunctions');

class ZoneTelechargementParser {
    constructor(devMode=false,timeStamp=false, axiosRequestTimeInBetween=300) {
        this._ZTBaseURL = `https://www.zone-telechargement.homes` 
        this._allCategories = [ "films", "series", "jeux", "musiques", "mangas", "ebooks", "autres-videos", "logiciels", "mobiles" ]
        this._lastAxiosRequestTimestamp = 0 // Do not edit this value. used as temp
        this._axiosRequestTimeInBetween = axiosRequestTimeInBetween // Default: 300 - In milliseconds. Minimum time to wait between each requests to the base URL. Low values can cause functions to crash due to HTPP error 520 from axios. (Or rate limit errors)
        this._devMode = devMode;
        this._devMode && console.log("ztParser: Dev mode enabled.")
        this._timeStamp = timeStamp
    }
    
    _getBaseURL() { return this._ZTBaseURL }
    _getAllCategories() { return this._allCategories }
    _getMatchingGroups = function(s) {
        try {
            var r=/\((.*?)\)/g, a=[], m;
            while (m = r.exec(s)) {
              a.push(m[1]);
            }
            return a;
        } catch(e) {
            if(this._devMode) console.log(e)
            return s
        }
    };
    _setAxiosRequestTimeInBetween(value) {
        if(typeof value != "number") throw new Error("Argument must be type of 'number'.")
        this._axiosRequestTimeInBetween = value
    }
    _setDevMode(value) {
        if(typeof value != "boolean") throw new Error("Argument must be type of 'boolean'.")
        this._devMode = !!value
    }

    _getPayloadURLFromQuery(category, query, page=1) {
        if(typeof page != "number") throw new Error(`ztParser._getPayloadURLFromQuery(): 'page' must be type of 'number'`)
        category = category.trim().toLowerCase()
        if(!this._allCategories.includes(category)) throw new Error(`ztParser._getPayloadURLFromQuery(): 'category' must be one in the following list: ${this._getAllCategories().join(", ")}`)
        return this._getBaseURL() + `/?p=${category}&search=${encodeURI(query)}&page=${page}`
    }

    async _getDOMElementFromURL(url) {
        if (this._timeStamp){
            console.log("========================================================")
            console.log("A:",Date.now()-this._lastAxiosRequestTimestamp)
            console.log("B:",this._axiosRequestTimeInBetween)
            console.log("C:",this._axiosRequestTimeInBetween - (Date.now()-this._lastAxiosRequestTimestamp))
            console.log("--------------------------------------------------------")
        }
        if (Date.now() - this._lastAxiosRequestTimestamp < this._axiosRequestTimeInBetween) {
            await somef.sleep(this._axiosRequestTimeInBetween - (Date.now() - this._lastAxiosRequestTimestamp));
        }
        this._lastAxiosRequestTimestamp = Date.now();

        const response = await axios.get(url);
        return cheerio.load(response.data);
    }

    async _parseMoviesFromSearchQuery(category, query, page) {
        const payloadURL = this._getPayloadURLFromQuery(category, query, page);
        const $ = await this._getDOMElementFromURL(payloadURL);
    
        const movieList_elements = $("#dle-content .cover_global");
        const responseMovieList = [];
    
        if (movieList_elements.length === 0) {
            return responseMovieList;
        }
    
        movieList_elements.each((index, element) => {
            const elem = $(element);
    
            const titleAnchor = elem.find(".cover_infos_title a");
            const the_url = this._getBaseURL() + titleAnchor.attr("href");
    
            const detail_release = elem.find(".cover_infos_global .detail_release");

            const publishDate = new Date(elem.find("time").text());
    
            const movieDatas = {
                title: titleAnchor.text(),
                url: the_url,
                id: the_url.match(/[?&]id=[0-9]{1,5}\-/gmi)[0].match(/\d+/)[0],
                image: this._getBaseURL() + elem.find("img").attr("src"),
                quality: detail_release.find("span:eq(0)").text(),
                language: detail_release.find("span:eq(1)").text(),
                publishedOn: publishDate,
                publishedTimestamp: publishDate.getTime(),
            };
            responseMovieList.push(movieDatas);
        });
    
        return responseMovieList;
    }
    
    useBaseURL(url) {
        this._ZTBaseURL = url
        return true
    }

    async searchAll(category, query) {
        try {
            let responseMovieList = []
            let tempMovieList = false
            let searchPage = 0
            while(tempMovieList.length != 0) {
                searchPage++
                tempMovieList = await this._parseMoviesFromSearchQuery(category, query, searchPage)
                responseMovieList = responseMovieList.concat(tempMovieList)
                console.log(`Added ${tempMovieList.length} movies from page ${searchPage}`)
            }
            return responseMovieList
        } catch(e) {
            if(this._devMode) console.log(e)
            return {
                status: false,
                error: `${e}`,
                stack: e.stack.split("\n"),
            }
        }
    }

    async search(category, query, page) {
        try {
            let responseMovieList = await this._parseMoviesFromSearchQuery(category, query, page)
            return responseMovieList
        } catch(e) {
            if(this._devMode) console.log(e)
            return {
                status: false,
                error: `${e}`,
                stack: e.stack.split("\n"),
            }
        }
    }



    async getMovieDetails(movieTitle) {
        /*
        Example:
        
        getMovieDetails:  {
            adult: false,
            backdrop_path: '/cyecB7godJ6kNHGONFjUyVN9OX5.jpg',
            genre_ids: [ 28, 878, 12 ],
            id: 1726,
            original_language: 'en',
            original_title: 'Iron Man',
            overview: 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
            popularity: 76.266,
            poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
            release_date: '2008-04-30',
            title: 'Iron Man',
            video: false,
            vote_average: 7.638,
            vote_count: 24683
        }*/
        try {
            const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: moviesDb,
                    query: movieTitle,
                },
            });
    
            const imgUrl = "https://image.tmdb.org/t/p/w780";
    
            const genresListResponse = await axios.get(`https://api.themoviedb.org/3/genre/movie/list`, {
                params: {
                    api_key: moviesDb,
                },
            });
            const genresList = genresListResponse.data.genres;
    
            const movieDetails = response.data.results[0];

            const genreNames = movieDetails.genre_ids.map(id => {
                const genre = genresList.find(genre => genre.id === id);
                return genre ? genre.name : '';
            });
    
            const data = {
                title: movieDetails.original_title,
                original_language: movieDetails.original_language,
                description: movieDetails.overview,
                poster: imgUrl + movieDetails.poster_path,
                release_date: movieDetails.release_date,
                genres: genreNames,
            };
    
            return data;
        } catch (error) {
            console.error('Erreur lors de la requête :', error);
            return null;
        }
    }
    
    
}    

let ZT = new ZoneTelechargementParser()

module.exports = new ZoneTelechargementParser()