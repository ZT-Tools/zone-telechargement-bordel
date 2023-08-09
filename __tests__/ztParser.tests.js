
const ZTP = require("../localModules/ztParser")
ZTP._setAxiosRequestTimeInBetween(400)
ZTP._setDevMode(false)

/*
let a = [
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=8726-iron-man',
      id: '8726',
      image: 'https://www.zone-telechargement.homes/img/films/2019f13d1b9f3d6a9154be3e531df256.webp',
      quality: 'DVDRIP',
      language: 'TRUEFRENCH',
      publishedOn: 2019-03-02T23:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=9803-iron-man-2',
      id: '9803',
      image: 'https://www.zone-telechargement.homes/img/films/a8f04804183c48a30b3d4962e23e2aef.webp',
      quality: 'DVDRIP',
      language: 'FRENCH',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=9807-iron-man',
      id: '9807',
      image: 'https://www.zone-telechargement.homes/img/films/17e8182cd59e05fe72bc1d32e4bc27a7.webp',
      quality: 'BLU-RAY 720p',
      language: 'FRENCH',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=9808-iron-man',
      id: '9808',
      image: 'https://www.zone-telechargement.homes/img/films/634cfe13c3dd3593ca775a32f0fb3764.webp',
      quality: 'BLU-RAY 1080p',
      language: 'MULTI (FRENCH)',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=9810-iron-man',
      id: '9810',
      image: 'https://www.zone-telechargement.homes/img/films/3816d178818ea395f588fca2867ee1f9.webp',
      quality: 'BLURAY REMUX 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=9811-iron-man-2',
      id: '9811',
      image: 'https://www.zone-telechargement.homes/img/films/1cf647cba8356e9e1166c20ff49019a6.webp',
      quality: 'BLURAY REMUX 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=9812-iron-man-3',
      id: '9812',
      image: 'https://www.zone-telechargement.homes/img/films/e1099a1a8a788e7d600860f3e3add331.webp',
      quality: 'BLURAY REMUX 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2019-04-29T22:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=10025-iron-man-3',
      id: '10025',
      image: 'https://www.zone-telechargement.homes/img/films/00d48b7f471f661058d5179a8848e22f.webp',
      quality: 'BRRIP',
      language: 'VOSTFR',
      publishedOn: 2019-05-12T22:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=10158-iron-man-3',
      id: '10158',
      image: 'https://www.zone-telechargement.homes/img/films/97400a7c7015d01a9f427bf1ce370a12.webp',
      quality: 'BDRIP',
      language: 'FRENCH',
      publishedOn: 2019-05-20T22:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=10347-iron-man-2',
      id: '10347',
      image: 'https://www.zone-telechargement.homes/img/films/0a8024ec899ab2c5f8bddc2424c0b2b2.webp',
      quality: 'HDLIGHT 720p',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2019-05-27T22:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=10348-iron-man-2',
      id: '10348',
      image: 'https://www.zone-telechargement.homes/img/films/6ae0cdd01aeb23e9c9f1e8681e4f2329.webp',
      quality: 'HDLIGHT 1080p',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2019-05-27T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=24007-iron-man',
      id: '24007',
      image: 'https://www.zone-telechargement.homes/img/films/f36182d7f4514e34fc3b18bd988e0b86.webp',
      quality: '4K LIGHT',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2021-04-02T22:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=24008-iron-man-2',
      id: '24008',
      image: 'https://www.zone-telechargement.homes/img/films/e237a24e1ad1db43250ade91479b70ba.webp',
      quality: '4K LIGHT',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2021-04-02T22:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=24009-iron-man-3',
      id: '24009',
      image: 'https://www.zone-telechargement.homes/img/films/7fc73cde330893eed9a4a9ec62ff3087.webp',
      quality: '4K LIGHT',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2021-04-02T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=30806-iron-man',
      id: '30806',
      image: 'https://www.zone-telechargement.homes/img/films/5b37aee186f26c8baba8a8f305b4ea4f.webp',
      quality: 'HDLIGHT 1080p',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-03-19T23:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=32796-iron-man-3',
      id: '32796',
      image: 'https://www.zone-telechargement.homes/img/films/ebf5c0c2e584728cf32e281602df5a67.webp',
      quality: 'HDLIGHT 1080p',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-07-16T22:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=35600-iron-man',
      id: '35600',
      image: 'https://www.zone-telechargement.homes/img/films/77cd3d91b15601619f9a7810c9915f6c.webp',
      quality: 'WEBRIP 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-11-10T23:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=35620-iron-man',
      id: '35620',
      image: 'https://www.zone-telechargement.homes/img/films/054c3de4fa1c95bc5f7227dc3b8af6be.webp',
      quality: 'HDRIP 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-11-11T23:00:00.000Z
    },
    {
      title: 'Iron Man',
      url: 'https://www.zone-telechargement.homes?p=film&id=36154-iron-man',
      id: '36154',
      image: 'https://www.zone-telechargement.homes/img/films/86560265966c1333d48479dffbd64bfa.webp',
      quality: 'BLURAY 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-11-27T23:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=36155-iron-man-2',
      id: '36155',
      image: 'https://www.zone-telechargement.homes/img/films/67a0125db9028d192833ce2fb0a48f40.webp',
      quality: 'BLURAY 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-11-27T23:00:00.000Z
    },
    {
      title: 'Iron Man 3',
      url: 'https://www.zone-telechargement.homes?p=film&id=36156-iron-man-3',
      id: '36156',
      image: 'https://www.zone-telechargement.homes/img/films/c6076e4dffacef952bb88de5688ab815.webp',
      quality: 'BLURAY 4K',
      language: 'MULTI (TRUEFRENCH)',
      publishedOn: 2022-11-27T23:00:00.000Z
    },
    {
      title: 'Iron Man 2',
      url: 'https://www.zone-telechargement.homes?p=film&id=39376-iron-man-2',
      id: '39376',
      image: 'https://www.zone-telechargement.homes/img/films/f10edbb3e7cc5008adfab109fb719c25.webp',
      quality: 'BLU-RAY 720p',
      language: 'TRUEFRENCH',
      publishedOn: 2023-04-10T22:00:00.000Z
    },
    {
      title: 'Mythica: The Iron Crown',
      url: 'https://www.zone-telechargement.homes?p=film&id=2037-mythica-the-iron-crown',
      id: '2037',
      image: 'https://www.zone-telechargement.homes/img/films/55dab28e58c6fd0195936c92ddb7c81c.webp',
      quality: 'BDRiP',
      language: 'FRENCH',
      publishedOn: 2017-08-08T22:00:00.000Z
    },
    {
      title: 'Iron Arm: Le Justicier de Fer',
      url: 'https://www.zone-telechargement.homes?p=film&id=3986-iron-arm-le-justicier-de-fer',
      id: '3986',
      image: 'https://www.zone-telechargement.homes/img/films/fb0bf44f721ff3b46180023a396b3b90.webp',
      quality: 'BDRIP',
      language: 'FRENCH',
      publishedOn: 2018-03-22T23:00:00.000Z
    },
    {
      title: 'Iron Arm: Le Justicier de Fer',
      url: 'https://www.zone-telechargement.homes?p=film&id=3987-iron-arm-le-justicier-de-fer',
      id: '3987',
      image: 'https://www.zone-telechargement.homes/img/films/98a8a5c9fda28d5940797a50dcaf081d.webp',
      quality: 'BLU-RAY 720p',
      language: 'FRENCH',
      publishedOn: 2018-03-22T23:00:00.000Z
    }
  ]

  */

const logPrefix = "prod"

let categories = ZTP._getAllCategories()

for(let i in categories) {
  let categoryToCheck = categories[i]
  
  if(categoryToCheck != "films") continue; // ztParser only supports films category for now.

  let testsCount = 5

  test(`[${logPrefix}/category:${categoryToCheck} 1/${testsCount}] ZTP.search() returns an object`, async () => {
    let s1 = await ZTP.search("films","Iron man")
    let s2 = await ZTP.search("films","harry potter")
    let s3 = await ZTP.search("films","Iron man")
    let s4 = await ZTP.search("films","Iron man")

    expect(typeof s1).toBe("object")
    expect(typeof s2).toBe("object")
    expect(typeof s3).toBe("object")
    expect(typeof s4).toBe("object")
  });

  test(`[${logPrefix}/category:${categoryToCheck} 2/${testsCount}] ZTP.search() sends list in between 0 and 25 elements`, async () => {
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

  test(`[${logPrefix}/category:${categoryToCheck} 3/${testsCount}] ZTP.search() bad search returning empty list`, async () => {
    expect(await ZTP.search("films","z$*ù*ê*é*!;::/nzguejhfozf*!;::/nz")).toHaveLength(0);
    expect(await ZTP.search("films","z$*ù*ê*é*!;::/nzguejhfozf*!;::/nza")).not.toHaveLength(0) // Maybe due to searchbar size limit its glitching
    expect(await ZTP.search("films","////////////////////////////////////")).toHaveLength(0)
    expect(await ZTP.search("films","/////////////////////////////////////")).not.toHaveLength(0) // Maybe due to searchbar size limit its glitching
  });
  
}

