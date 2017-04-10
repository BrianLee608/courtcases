# Mapping of Court Cases to Entities and Concepts

This application is a submission for DevPost BitCamp 2017 at UMD.

Features:
  - Used IBM Watson API to perform word frequency analysis on Finra's legislative dataset
  - Interactive/responsive D3 US map UI
  - Maps US states to word-cloud frequency of common concepts in that state's legislative history
  - Maps US states to other US states based on legislative interactions between the two states

![](demopics/img0.png?raw=true)
![](demopics/img2.png?raw=true)
![](demopics/img3.png?raw=true)

### Installation

Install node dependencies

```sh
$ npm install
$ npm install -g gulp
```

Download mongodb at https://www.mongodb.com/download-center?jmp=nav#community

To run the production/dev server...
```sh
$ sudo mongod
$ gulp
$ // go to localhost:3000
```

APIs/Libraries used:
  - IBM Watson
  - Nodejs/express
  - Gulp
  - Ejs
  - Mongodb
  - jQuery
  - Python
  - AmCharts
  - D3js
