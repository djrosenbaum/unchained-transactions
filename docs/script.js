(function() {
  async function getTransactions(proto, quality) {
    const graphId = 'QmSoWqxoCBH6FeYPtrqEnVqAWEgxjpu2PD6xhjzUFPBzpf';      
    return await fetch(`https://api.thegraph.com/subgraphs/id/${graphId}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({query: `{ transactions(first: 50, orderBy: timestamp, orderDirection: desc, where:{ proto: ${proto}, quality: ${quality}, market_not: null }) { price timestamp } }`})
    })
    .then(r => r.json())
    // .then(data => console.log('data returned:', data.data));
  }

  async function handleInput() {
    const proto = document.querySelector('#proto').value;
    const quality = document.querySelector('#quality').value;

    const data = await getTransactions(proto, quality);
    console.log('data:', data);

    generateChart(data.data);
  }

  function generateChart(data) {
    document.querySelector('.canvas-wrapper').innerHTML = '<canvas id="myChart" width="800" height="400"></canvas>';

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: getLabels(),
        datasets: [{
          color: "#ffffff",
          label: 'Token Price',
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

    function getLabels() {
      return data.transactions.map((transaction) => {
        const date = new Date(transaction.timestamp * 1000).toLocaleDateString();
        // const price = ethers.utils.formatEther(transaction.price);
        return date;
      }).reverse();
    }

    function getPrice() {
      return data.transactions.map((transaction) => ethers.utils.formatEther(transaction.price)).reverse();
    }
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