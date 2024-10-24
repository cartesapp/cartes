# Cartes

> Venez discuter du projet sur le [canal matrix](https://matrix.to/#/#cartes:matrix.org) !

## Kesako ?

C'est **une application Web de cartographie généraliste**, basée sur les données d'OpenStreetMap et d'autres projets de communs comme Wikimedia Commons (pour les images) ou Wikipedia.

Deux objectifs :

-   pouvoir explorer la France, ses lieux d'intérêt (commerces, attractions touristiques, etc) sans dépendre de Google, Apple et autre GAFAM
-   proposer des calculateurs d'itinéraires écologiques

Découvrez [nos motivations](https://cartes.app/blog/un-beau-voyage) et les dernières nouveautés dans [le blog](https://cartes.app/blog).

## Comment contribuer ?

C'est par ici : [guide de contribution](https://github.com/laem/cartes/blob/master/CONTRIBUTING.md) !
Vous pouvez aussi poser des questions sur la section issues ou sur le [canal matrix](https://matrix.to/#/#cartes:matrix.org) pour les questions plus informelles.

## Et techniquement

I started implementing this map in november 2023 as a kind of personal useful advent of code. I quickly figured out the open source tech and data in 2023 to make modern map interface have become incredibly mature, compared to 10 years ago. You get 3D buildings, vector tiles in 1 h of dev.

The app is based on :

-   data : OSM (of course), Wikimedia commons (for the images), Wikidata, Wikipedia
-   code : nextjs, maplibre, styled-components
-   hosting : maptiler for the vector map tiles, vercel for JS deployment, Photon API by Komoot.

To set it up on your local computer, just run :

```
bun install # We're using bun because npm can't handle the experimental react 19 version, it breaks the install
```

You'll have to create your free MapTiler key and put it in a `.env.local` file at the root of the cartes folder:

```
NEXT_PUBLIC_MAPTILER=YOUR_KEY
```

## Contact

If you have any problem contributing (PR, vercel deployments, etc) feel free to contact me @maelito:matrix.org if I dont answer your issues quickly.

## Similar projects

Checkout [OSMApp](https://github.com/zbycz/osmapp/issues/217). Qwant Maps would be the other similar projet, but it's not developped anymore.

## Credits

This app makes full use of a multiple of open source libraries.

Including code inspired or directly taken from [OSMApp](https://github.com/zbycz/osmapp).

Icons are [OSMAnd](https://github.com/osmandapp/OsmAnd-resources/)'s.
