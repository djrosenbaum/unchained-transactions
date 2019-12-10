(function() {
  async function getTransactions(proto, quality) {
    const graphId = 'QmSoWqxoCBH6FeYPtrqEnVqAWEgxjpu2PD6xhjzUFPBzpf';
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

    const data = await getTransactions(proto, quality);
    console.log('data:', data);

    showCard(proto, quality);
    generatePriceChart(data.data);
    generateVolumeChart(data.data);
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
          label: 'line price',
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
          label: 'bar volume',
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

  function generateOptions() {
    const markup = window.cards.sort((a, b) => a.name > b.name ? 1 : -1).reduce((acc, card) => {
      return acc + `<option value="${card.proto}">${card.name}</option>`;
    },'');

    document.querySelector('#proto').innerHTML = markup;
  }

  window.addEventListener('DOMContentLoaded', (event) => {
    generateOptions();
    document.addEventListener('input', handleInput, false);
    
    handleInput();
  });
})();