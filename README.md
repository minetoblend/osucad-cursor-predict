# osucad-cursor-predict

This is an attempt to create human-like cursor movement from osu beatmap snippets, for [osucad](https://www.github.com/minetoblend/osu-cad).

## Generating the dataset
The dataset is currently being generated from osu replays and .osr and .osu files using typescript.
The scripts assume the following directory structure:
```
project-directory/
├─ data/
│  ├─ beatmaps/
│  │  ├─ [beatmap-hash].osu
│  ├─ osr/
│  │  ├─ [replay-hash].osr
├─ index.csv
```
The index.csv file should follow the format of the file found in the dataset linked below.

To generate the dataset from the beatmaps/replays:
```shell
npm install
npm start
```
## Obtaining replay & batmap data

The dataset I used for this can be found on [kaggle](https://www.kaggle.com/datasets/skihikingkevin/ordr-replay-dump).

## Change score filtering

Currently scores are being filtered by a few criteria, the most important ones being:
- only plays with 100% accuracy (To make sure the bot plays well)
- Only maps with more than 50 objects (and at least 1 slider as well as at least 1 circle)
- Only maps between 4 and 7.5 stars in difficulty
- No maps that have the user name osu! or osu!lazer (To filter out plays by auto)

Take a look at [src/filter.ts](src/filter.ts) if you want to adjust the filtering. 


