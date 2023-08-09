
const ZTP = require("../localModules/ztParser")
ZTP._setAxiosRequestTimeInBetween(400)
ZTP._setDevMode(false)

const logPrefix = "prod"

let categories = ZTP._getAllCategories()

for(let i in categories) {
  let categoryToCheck = categories[i]
  
  if(categoryToCheck != "films") continue; // ztParser only supports films category for now.

  test(`[${logPrefix}/category:${categoryToCheck} 1] ZTP.search() returns an object`, async () => {
    let s1 = await ZTP.search("films","Iron man")
    let s2 = await ZTP.search("films","harry potter")
    let s3 = await ZTP.search("films","Iron man")
    let s4 = await ZTP.search("films","Iron man")

    expect(typeof s1).toBe("object")
    expect(typeof s2).toBe("object")
    expect(typeof s3).toBe("object")
    expect(typeof s4).toBe("object")
  });

  test(`[${logPrefix}/category:${categoryToCheck} 2] ZTP.search() sends list in between 0 and 25 elements`, async () => {
    let s1 = await ZTP.search("films","Iron man")
    expect(s1.length).toBeGreaterThanOrEqual(0)
    expect(s1.length).toBeLessThan(26)

    let s2 = await ZTP.search("films","harry potter")
    expect(s2.length).toBeGreaterThanOrEqual(0)
    expect(s2.length).toBeLessThan(26)

    let s3 = await ZTP.search("films","fast and furious")
    expect(s3.length).toBeGreaterThanOrEqual(0)
    expect(s3.length).toBeLessThan(26)
  })

  test(`[${logPrefix}/category:${categoryToCheck} 3] ZTP.search() bad search returning empty list`, async () => {
    expect(await ZTP.search("films","z$*ù*ê*é*!;::/nzguejhfozf*!;::/nz")).toHaveLength(0);
    expect(await ZTP.search("films","z$*ù*ê*é*!;::/nzguejhfozf*!;::/nza")).not.toHaveLength(0) // Maybe due to searchbar size limit its glitching
    expect(await ZTP.search("films","////////////////////////////////////")).toHaveLength(0)
    expect(await ZTP.search("films","/////////////////////////////////////")).not.toHaveLength(0) // Maybe due to searchbar size limit its glitching
  });

  test(`[${logPrefix}/category:${categoryToCheck} 4] ZTP.search() search blocs are well built`, async () => {

    let testedMovies = [
      "Iron man",
      "harry potter",
      "fast and furious"
    ]

    for(let i in testedMovies) {

      let s1 = await ZTP.search("films",testedMovies[i])

      /* object.title */
      expect(s1.title).not.toBeUndefined()
      expect(typeof s1.title).toBe('string')
      expect(typeof s1.title).not.toBe('undefined')
      expect(typeof s1.title).not.toBe('null')
      expect(typeof s1.title).not.toBe('NaN')

      /* object.url */
      expect(s1.url).not.toBeUndefined()
      expect(typeof s1.url).toBe('string')
      expect(s1.url).toMatch(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
      expect(s1.url).not.toMatch(/(undefined(\/)?)$/)

      /* object.id */
      expect(s1.id).not.toBeUndefined()
      expect(typeof s1.id).toBe('string')
      expect(s1.id).toMatch(/\d+/)

      /* object.image */
      expect(s1.image).not.toBeUndefined()
      expect(typeof s1.image).toBe('string')
      expect(s1.image).toMatch(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
      expect(s1.image).not.toMatch(/(undefined(\/)?)$/)

      /* object.quality */
      expect(s1.quality).not.toBeUndefined()
      expect(typeof s1.quality).toBe('string')
      let all_quality = [
        'DVDRIP',
        'BLU-RAY',
        'BLURAY',
        'BRRIP',
        'BDRIP',
        'HDLIGHT',
        '4K',
        'WEBRIP',
        'HDRIP'
      ]
      expect(somef.anyWordInText(s1.quality, all_quality, false)).toBe(true)

      /* object.language */
      expect(s1.language).not.toBeUndefined()
      expect(typeof s1.language).toBe('string')

      /* object.publishedOn */
      expect(s1.publishedOn).not.toBeUndefined()
      expect(typeof s1.publishedOn).toBe('object')

      /* object.publishedTimestamp */
      expect(s1.publishedTimestamp).not.toBeUndefined()
      expect(typeof s1.publishedTimestamp).toBe('number')

    }

    /*
    
    { // Code below is from package.json 1.1.0 - 09/08/2023
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=8726-iron-man',
      id: '8726',
      image: 'https://www.zone-telechargement.homes/img/films/2019f13d1b9f3d6a9154be3e531df256.webp',
      quality: 'DVDRIP',
      language: 'TRUEFRENCH',
      publishedOn: 2019-03-02T23:00:00.000Z
    },
    */
    
  });
  
}

