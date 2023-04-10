# NYC Crime Data Visualization Demo

This is a demo of a data visualization app built with React and D3.js. The app displays various charts that show the distribution of crime data in New York City.

## Installation

To install and run the app locally, follow these steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/UOA-CS732-SE750-Students-2023/cs732-se75-assignment-Shuyi829.git
    ```

2. Navigate into the project directory:

    ```bash
    cd cs732-se75-assignment-Shuyi829
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm start
    ```

5. Open your browser and go to `http://localhost:xxxx` to see the app running.

## Usage

The app is designed to provide users with a comprehensive overview of crime data for different precincts in New York City. The user interface features several charts that display crime data in a visually appealing manner.

### Precinct Map

The precinct map is a key component of the app's user interface. It provides users with a detailed view of the different precincts in New York City. Users can hover over each precinct to see more information about crime data for that particular area. A precinct map is an essential tool for users who want to gain a deeper understanding of crime trends in specific neighbourhoods.

### Age Distribution Chart

The age distribution chart shows the distribution of crime data by age range. You can hover over different areas on the map to see how crime data is distributed for different precincts.

### Race Distribution Chart

The race distribution chart shows the distribution of crime data by race. You can hover over different areas on the map to see how crime data is distributed for different precincts.

### Crime Type Distribution Chart

The crime type distribution chart shows the distribution of crime data by type of crime. You can hover over different areas on the map to see how crime data is distributed for different precincts. You can also click on a part of the distribution graph, which will show the heatmap of the corresponding crime type.

### Reset Button

When a specific area of the crime type distribution chart is clicked, the display of the heat map corresponding to that particular crime type will be activated. Clicking the reset button will end the display of the single crime type heat map and return to the initial state, displaying the New York City crime heat map for all crime types.

## Data Sources

The crime data used in this app was obtained from the [New York City Police Department](https://www1.nyc.gov/site/nypd/stats/crime-statistics/crime-statistics-landing.page).