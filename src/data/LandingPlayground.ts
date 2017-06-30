export const simpleQuery = (endpoint: string) => `\
---
endpoint: ${endpoint}
disabled: false
---
{
  Movie(id: "cixos5gtq0ogi0126tvekxo27") {
    id
    title
    actors {
       name
    }
  }
}
---
{
  "data": {
    "Movie": {
      "id": "cixos5gtq0ogi0126tvekxo27",
      "title": "Inception",
      "actors": [
        {
          "name": "Leonardo DiCaprio"
        },
        {
          "name": "Ellen Page"
        },
        {
          "name": "Tom Hardy"
        },
        {
          "name": "Joseph Gordon-Levitt"
        },
        {
          "name": "Marion Cotillard"
        }
      ]
    }
  }
}`
