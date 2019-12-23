(function() {
  const graphId = 'QmSoWqxoCBH6FeYPtrqEnVqAWEgxjpu2PD6xhjzUFPBzpf';
  const marketData = {
    fetched: false,
    transactions: []
  };

  window.marketData = marketData;

  async function getTransactions(proto, quality) {
    return await fetch(`https://api.thegraph.com/subgraphs/id/${graphId}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({query: `{ transactions(first: 1000, orderBy: timestamp, orderDirection: desc, where:{ proto: ${proto}, quality: ${quality}, market_not: null }) { price timestamp } }`})
    })
    .then(r => r.json())
    // .then(data => console.log('data returned:', data.data));
  }

  async function getMarketVolume(skip) {
    marketData.fetched = true;
    const currentHour = parseInt(moment().format('H'));
    const timestamp = parseInt(moment().subtract(currentHour,'H').format('X'), 10);

    const data = await fetch(`https://api.thegraph.com/subgraphs/id/${graphId}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({query: `{ transactions(first: 1000, skip:${skip * 1000} orderBy: timestamp, orderDirection: desc, where:{ timestamp_gt: ${timestamp}, market_not: null }) { price timestamp } }`})
    })
    .then(r => r.json());

    return data;
  }

  function getLimit() {
    const w = window.innerWidth;
    if (w < 600) {
      return 20;
    }
    if (w < 800) {
      return 30;
    }
    if (w < 1000) {
      return 40;
    }
    return 50;
  }

  async function handleInput() {
    const proto = document.querySelector('#proto').value;
    const quality = document.querySelector('#quality').value;

    updateUrl(proto, quality);

    const data = await getTransactions(proto, quality);
    console.log('data:', data);

    showCard(proto, quality);
    generatePriceChart(data.data);
    generateVolumeChart(data.data);

    if (!marketData.fetched) {
      await getAllMarketData(0);
      generateMarketVolumeChart();
    }
  }

  async function getAllMarketData(skip) {
    const data = await getMarketVolume(skip);
    marketData.transactions = marketData.transactions.concat(data.data.transactions);

    if (data.data.transactions.length === 1000) {
      await getAllMarketData(skip + 1);
    }
  }

  function showCard(proto, quality) {
    document.querySelector('.card-wrapper').innerHTML = `<composited-card class="card" protoId="${proto}" quality="${quality}" responsiveSrcsetSizes="(min-width: 250px) 160px, 320px"></composited-card>`;
  }

  function generatePriceChart(data) {
    document.querySelector('#price_chart').innerHTML = '<canvas id="priceChart"></canvas>';

    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: getPriceLabels(),
        datasets: [{
          color: "#ffffff",
          label: 'price',
          data: getPrice(),
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          fill: false,
        }],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true,
              color: "#777"
            },
          }],
          xAxes: [{
            gridLines: {
              display: true,
              color: "#555"
            },
          }]
        },
        legend: {
          display: false
        },
      }
    });

    function getPriceLabels() {
      const transactions = data.transactions.slice(0, getLimit());
      return transactions.map((transaction) => {
        const date = new Date(transaction.timestamp * 1000).toLocaleDateString();
        // const price = ethers.utils.formatEther(transaction.price);
        return date;
      }).reverse();
    }

    function getPrice() {
      const transactions = data.transactions.slice(0, getLimit());
      return transactions.map((transaction) => ethers.utils.formatEther(transaction.price)).reverse();
    }
  }

  function generateVolumeChart(data) {
    document.querySelector('#volume_chart').innerHTML = '<canvas id="volumeChart"></canvas>';

    const ctx = document.getElementById('volumeChart').getContext('2d');

    const transactionsByDay = getTransactionsByDay(data);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: getVolumeLabels(),
        datasets: [{
          color: "#ffffff",
          label: 'transactions',
          data: getVolume(),
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          fill: false,
        }],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true,
              color: "#777"
            },
          }],
          xAxes: [{
            gridLines: {
              display: true,
              color: "#555"
            },
          }]
        },
        legend: {
          display: false
        },
      }
    });

    function getVolumeLabels() {
      return Object.keys(transactionsByDay).reverse();
    }

    function getVolume() {
      return Object.keys(transactionsByDay).map(day => transactionsByDay[day].total).reverse();
    }
  }

  function generateMarketVolumeChart() {
    document.querySelector('#market_chart').innerHTML = '<canvas id="marketChart"></canvas>';

    const ctx = document.getElementById('marketChart').getContext('2d');

    const transactionsByHour = getTransactionsByHour(marketData);

    console.log('transactionsByHour:', transactionsByHour);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: getVolumeLabels(),
        datasets: [{
          color: "#ffffff",
          label: 'transactions',
          data: getVolume(),
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          fill: false,
        }],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: true,
              color: "#777"
            },
          }],
          xAxes: [{
            gridLines: {
              display: true,
              color: "#555"
            },
          }]
        },
        legend: {
          display: false
        },
      }
    });

    function getVolumeLabels() {
      return Object.keys(transactionsByHour);
    }

    function getVolume() {
      return Object.keys(transactionsByHour).map(hour => transactionsByHour[hour].total);
    }
  }

  function getTransactionsByDay(data) {
    const dates = {};

    for (let i = 0; i < 10; i++) {
      let date = moment().subtract(i,'d').format('YYYY-MM-DD');
      dates[date] = {total: 0};
    }

    data.transactions.forEach((transaction) => {
      const date = moment(transaction.timestamp * 1000).format('YYYY-MM-DD');
      if (dates[date]) {
        dates[date].total++;
      }
    });

    return dates;
  }

  function getTransactionsByHour(data) {
    const currentHour = parseInt(moment().format('H'));

    const hours = {};
    for (let i = 0; i <= currentHour; i++) {
      hours[i] = {total: 0};
    }

    data.transactions.forEach((transaction) => {
      const hour = moment(transaction.timestamp * 1000).format('H');
      if (hours[hour]) {
        hours[hour].total++;
      }
    });

    return hours
  }

  function generateOptions() {
    const markup = window.cards.sort((a, b) => a.name > b.name ? 1 : -1).reduce((acc, card) => {
      return acc + `<option value="${card.proto}">${card.name}</option>`;
    },'');

    document.querySelector('#proto').innerHTML = markup;
  }

  function updateUrl(proto, quality) {
    const state = { proto, quality };
    const title = 'Unchained Marketprice';
    const url = `${window.location.href.split('?')[0]}?proto=${proto}&quality=${quality}`;

    history.pushState(state, title, url);
  }

  window.addEventListener('DOMContentLoaded', (event) => {
    generateOptions();
    document.addEventListener('input', handleInput, false);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('proto') && urlParams.has('quality')) {
      document.querySelector('#proto').value = urlParams.get('proto');
      document.querySelector('#quality').value = urlParams.get('quality');
    }
    
    handleInput();
  });
})();