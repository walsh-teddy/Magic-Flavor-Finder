// https://scryfall.com/docs/syntax USE FOR REFERENCE
// Also: https://scryfall.com/docs/api/cards/search
// https://api.scryfall.com/cards/search? (BASE) (Add in new queries afrer ? and seperate them with &)
// Example: Find red creatures with 3 power, sorted by converted mana cost would be:
// https://api.scryfall.com/cards/search?order=cmc&q=c%3Ared+pow%3D3

// https://api.scryfall.com/cards/search?q=c

"use strict";

const scryfallURL = "https://api.scryfall.com/cards/search?";

let buttons;

window.onload = start;

// Holds references to the buttons
let searchButton;
let colorButtons;
let exclusivityButtons;
let sortButtons;
let directionButtons;
let nameBar;

// Words that will be displayed in the search terms
let displayTerm;
let displayColor;
let displayExclusivity;
let displaySort;
let displayDirection;
let displayName;

// Words that will be added to the URL
let url;
let colorURL = "";
let exclusivityURL;
let sortURL;
let directionURL;
let nameURL;

// Saves the url of the next page if there is one
let nextURL = "";

function start() {
    searchButton = document.querySelector("#search");
    searchButton.onclick = search;
    colorButtons = document.querySelectorAll("input[name='colorButton']");
    exclusivityButtons = document.querySelectorAll("input[name='exclusivityButton']");
    sortButtons = document.querySelectorAll("input[name='sortButton']");
    directionButtons = document.querySelectorAll("input[name='directionButton']");
    nameBar = document.querySelector("#nameBar");

    // Load in the saved info
    LoadInfo();
}

// keys of the saved info on the server
const prefix = "tjw6911-";
const colorKey = prefix + "colors";
const exclusivityKey = prefix + "exclusivity";
const sortKey = prefix + "sort";
const directionKey = prefix + "direction";
const nameKey = prefix + "name";
let savedColors = [false, false, false, false, false];

// Fills in all the saved info from the user (their last search)
function LoadInfo() {
    // Tests if there is info saved there yet
    if (localStorage.getItem(colorKey)) // There is info stored
    {
        console.log("Loading info from local storage!");

        // Record the color button array
        savedColors = JSON.parse(localStorage.getItem(colorKey));

        // Load in the saved array
        for (let i = 0; i < savedColors.length; i++) 
        {
            // Save if it was checked or not
            colorButtons[i].checked = savedColors[i];
        }

        // Load saved exclusivity info (saved info is the id)
        document.querySelector(`#${localStorage.getItem(exclusivityKey)}`).checked = true;

        // Load saved sort info (saved info is the id)
        document.querySelector(`#${localStorage.getItem(sortKey)}`).checked = true;

        // Load saved direction info (saved info is the id)
        document.querySelector(`#${localStorage.getItem(directionKey)}`).checked = true;

        // Load saved name info into the text box
        nameBar.value = localStorage.getItem(nameKey);
    }
}

function search() {
    // Reset the savedColors array
    savedColors = [false, false, false, false, false];

    // Change this to false if any color is selected (and let it be proven false)
    let colorless = true;

    // Reset the color URl (its the only one that gets added to rather than set)
    colorURL = "";
    displayColor = "";
    let firstColor = true;

    // Loop through each color button
    for (let i = 0; i < colorButtons.length; i++) {

        // Test if the button was clicked
        if (colorButtons[i].checked) // It was clicked
        {
            // Add the search query to the url
            colorURL += colorButtons[i].attributes.url.value;

            // Add the color to the display search (with a comma or not depending on if its the first thing)
            if (firstColor) {
                displayColor += colorButtons[i].attributes.displayTerm.value;
                firstColor = false;
            }
            else {
                displayColor += `, ${colorButtons[i].attributes.displayTerm.value}`;
            }

            // Mark that there has been a color
            colorless = false;

            // Save it into the savedColors array
            savedColors[i] = true;
        }
    }

    // If there was nothing selected then search for just colorless cards
    if (colorless) {
        // Add it to the search
        colorURL += "c";

        // Add it to the display term
        displayColor = "colorless";
    }

    // Save the colors
    localStorage.setItem(colorKey, JSON.stringify(savedColors));

    // Loop through each exclusivity button
    for (let i = 0; i < exclusivityButtons.length; i++) {

        // Test if the button was clicked
        if (exclusivityButtons[i].checked) // It was clicked
        {
            // Add the search query to the url
            exclusivityURL = exclusivityButtons[i].attributes.url.value;

            // Add the color to the display search
            displayExclusivity = exclusivityButtons[i].attributes.displayTerm.value;

            // Save it to local storage
            localStorage.setItem(exclusivityKey, exclusivityButtons[i].id);
        }
    }

    // Loop through each sort button
    for (let i = 0; i < sortButtons.length; i++) {

        // Test if the button was clicked
        if (sortButtons[i].checked) // It was clicked
        {
            // Add the search query to the url
            sortURL = sortButtons[i].attributes.url.value;

            // Add the order to the display search
            displaySort = sortButtons[i].attributes.displayTerm.value;

            // Save it to local storage
            localStorage.setItem(sortKey, sortButtons[i].id);
        }
    }

    // Loop through each direction button
    for (let i = 0; i < directionButtons.length; i++) {

        // Test if the button was clicked
        if (directionButtons[i].checked) // It was clicked
        {
            // Add the search query to the url
            directionURL = directionButtons[i].attributes.url.value;

            // Add the order to the display search
            displayDirection = directionButtons[i].attributes.displayTerm.value;

            // Save it to local storage
            localStorage.setItem(directionKey, directionButtons[i].id);
        }
    }

    // Add the searched name if they typed in something
    if (nameBar.value) {
        nameURL = `${nameBar.value}&`;
        displayName = `"${nameBar.value}"`;
        localStorage.setItem(nameKey, nameBar.value);
    }
    else {
        nameURL = "";
        displayName = "something";
        localStorage.setItem(nameKey, "");
    }

    displayTerm = `${displayName} that ${displayExclusivity} ${displayColor} sorted in ${displayDirection} ${displaySort}`;
    url = `${scryfallURL}q=${nameURL}color${exclusivityURL}%3D${colorURL}&order=${sortURL}&dir=${directionURL}`;

    console.log(url);
    getFirstData(url);
}

// Clears everything and then searches for soemthing new
function getFirstData(url) {
    document.querySelector("#displayList").innerHTML = "";
    getData(url);
}

// Calls when you click the next page button (get new data without clearing everyhting)
function getNewData() {
    getData(nextURL);
}

function getData(url) {
    // Create new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload header
    xhr.onload = dataLoaded;

    // Set the onerror handeler
    xhr.onerror = dataError;

    // Open connection and secure the reqeuest
    xhr.open("GET", url);
    xhr.send();
}

function dataError(e) {
    console.log("An error occurred");
}

function dataLoaded(e) {
    // event.target is the next xhr object
    let xhr = e.target;

    // xhr.responseText is the JSON file we just downloaded
    // console.log(xhr.responseText);

    // Trun the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    // TODO: Make this error catch work
    if (false) {
        document.querySelector("#Status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        document.querySelector("#displayList") = "";
        document.querySelector("#nextButtonZone") = "";
        return; // Bail out
    }

    // Start building an HTML string we will display to the user
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "";

    // Loop through the array of the results
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        // console.log(`Attempting to scan: ${result.name}`); // Uncomment this to find out what is breaking mid-search

        // Build a <div> to hold each string
        // ES6 String Templating
        let line = `<div class="card">`
        line += `<a href=${result.scryfall_uri} target="_blank" rel="noopener noreferrer">${result.name}</a>`;

        // Add the art
        if (result.image_uris) { // It has 1 image
            line += `<img src=${result.image_uris.art_crop} alt="Art of ${result.name}">`;
        }
        else // Its dual faced
        {
            // Just get the 1st face for now
            line += `<img src=${result.card_faces[0].image_uris.art_crop} alt="Art of ${result.name}">`
        }

        // Mark the artist's name 
        if (result.artist) // It has 1 artist
        {
            line += `<div class="artist">Art by "${result.artist}"</div>`;
        }
        else if (result.card_faces) // It has multiple artists
        {
            line += `<div class="artist">Art by "${result.card_faces[0].artist}"</div>`;
        }
        else // There is no artist listed (only for the dungeon cards)
        {
            line += `<div class="artist">Art by "Unknown". You'll probably only be seeing this if its a dungeon ;)</div>`;
        }

        // Mark it as legendary if it is
        if (result.type_line) // It has 1 type line
        {
            if (result.type_line.includes("Legendary")) {
                line += "<h3>Legend</h3>"
            }
        }
        else // It has multiple type lines
        {
            if (result.card_faces[0].type_line.includes("Legendary")) {
                line += "<h3>Legend</h3>"
            }
        }

        line += `<div class="flavor">`

        // Add the flavor text if it has any
        if (result.flavor_text) // It does
        {
            line += `<p>${result.flavor_text}</p>`;
        }
        else // It dose not
        {
            line += `<p>No flavor text :(</p>`;
        }
        line += `</div></div>`;

        // Another way of doing that but its a lot so Im not going to copy it. Its pretty far down this page: https://github.com/tonethar/IGME-235-Shared/blob/master/tutorial/HW-gif-finder-lab.md

        // Add the <div> to `bigString` and loop
        bigString += line;
    }

    // All done building the HTML. Show it to the user!
    document.querySelector("#displayList").innerHTML += bigString;

    // Update the status
    document.querySelector("#status").innerHTML = `<b>Succses!</b> <p><i>Here are ${results.length} results for '${displayTerm}'<br>` +
    `At: <a href=${url} target="_blank" rel="noopener noreferrer">${url}</a><br>` + 
    `This search has been saved and will be loaded in the next time you load the page.</i></p>`;

    // Create the next button if there is one
    if (obj.has_more) // There is another page
    {
        nextURL = obj.next_page;
        document.querySelector("#nextButtonZone").innerHTML = `<button id="nextButton">Next Page</button>`;
        document.querySelector("#nextButton").onclick = getNewData;
    }
    else // There is no other page
    {
        nextURL = "";
        document.querySelector("#nextButtonZone").innerHTML = "";
    }
}