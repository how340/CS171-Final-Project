# CS171 - Global Linguistic Diversity Visualization

## Introduction
This repository contains the source code for a web application designed to visualize the rich tapestry of linguistic diversity across the globe. Our project aims to provide an interactive, educational experience for users to explore the variety of languages spoken around the world, their geographic distribution, and the cultural contexts in which they exist.

## How to run the code

Our webpage is hosted at: https://how340.github.io/CS171-Final-Project/

The screencast video is stored on our google drive shared folder at: _____

The screencast video is also submitted in the zip file as well. 

Visiting the page requires no additional steps, but many of the visualizations are designed for a big screen. 
Make sure use a full screen (at least on a laptop) to maximize the viewing experience. 
Just pop-in and follow the instruction on each page to be along for the ride!

## Technology Stack
Frontend: HTML, CSS, JavaScript, bootstrap

Data Visualization: D3.js

Webpage scrolling/Pagination: fullpage.js - A copy is contained with submission in node_modules. But we are using CDN in the implementation of the website.  

## Code overview

Our overall webpage design is enabled by fullpage.js. The package is delivered to
our project via CDN and links in the html file. fullpage.js is responsible for the
scroll snapping behavior, right-side navigation bar, and the transition for each 
page's intialization. 

Our data comes from a variety of sources, including: Harvard dataverse, wikipedia, 
W3tech, and the US census. Harvard dataverse provided the language ethnologue data 
on the status of the global languages and most of the linguistic diversity data. 
Wikipedia and W3tech contributed to the development of the languages landscape on 
the internt visualization. The US census data was used to develop visualization 
on linguistics in the US> 

Each of our visualizations are fully created in D3 and styled either at initialization or through CSS. The techniques used in these visualizations are
mostly covered in our courses and we further improved on these techniques to implement the novel visualizations. 

