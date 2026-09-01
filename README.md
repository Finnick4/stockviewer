# Stock Viewer
Create your own hypothetical stocks. Track their prices and influence them with articles.

The Stock Viewer allows you to create your own stocks. These will passively change in order to simulate average stock price changes due to normal market behavior. You can also write articles to majorly influence selected stocks in both ways. Did your imaginary company release a great new product? The stock price rises and the price of the competition is lowered.

All influences on stocks by articles are modular by design. You can freely choose how much change will occur for how long. Should the rate of change fall of? You can also set that. 
None of these parameters have to be the same for different stocks influences in one article. One could therefore create an article increasing the value of one stock for a week whilst another stock suffers from a now better competition which the investors will take notice of during only the next hour.

Compare multiple stocks easily with a built in comparison tool. If you find that you are frequently visiting this comparison, create a stock group with said stocks as members. In general you can group related stocks together to see i.e. how much a cooperation with many subdivisions is valued. There you can also easily compare each of the grouped stocks.

## Administration
Each user of the app can be assigned a different set of permissions. These are precise by design, allowing for users to have i.e. only the ability to write articles and to only influence stocks up to a certain percentage. You are in charge for what you want the users to be able to do.

## Installation
In order for you to run this application, you **need** to have docker & docker compose installed.
In a new directory create a ´docker-compose.yaml´ file containing the following (or copy the `sample-docker-compose.yaml`):

```yaml
services:
  stockviewer.database:
    image: timescale/timescaledb-ha:pg18
    container_name: stockviewer.database
    restart: unless-stopped
    shm_size: 128mb
    volumes:
      - db:/home/postgres/pgdata/data/
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TIMESCALEDB_TELEMETRY: "off"
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U tsadmin -d tsdb" ]
      interval: 10s
      timeout: 5s
      retries: 5
  stockviewer.application:
    image: ghcr.io/finnick4/stockviewer:latest
    container_name: stockviewer.application
    restart: unless-stopped
    depends_on:
      stockviewer.database:
        condition: service_healthy
    environment:
      - LOG_LEVEL=${LOG_LEVEL}
      - PORT=${PORT}
      - DB_HOST=stockviewer.database
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - HTTPS_MODE=${HTTPS_MODE}
    ports:
      - ${PORT}:${PORT}
volumes:
  db:
```

and a ´.env´ file containing the following keys:

```.env
LOG_LEVEL=Info
PORT=8000
DB_HOST=stockviewer.database
DB_USER=<database user>
DB_PASSWORD=<database password>
DB_NAME=<database name>
HTTPS_MODE=true
```

