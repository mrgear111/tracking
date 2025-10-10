const { createApp, ref } = Vue

createApp({
  setup() {
    const users = ref([])
    const colleges = ref([])
    const owners = ref([])
    const repositories = ref([])
    const prs = ref([])

    const statistics = ref(null)

    function fetchData() {
      fetch('/api/GitHubPRs')
        .then((response) => response.json())
        .then((data) => {
          // console.log('Fetched PRs:', data)
          prs.value = data
        })
        .catch((error) => {
          console.error('Error fetching PRs:', error)
        })

      fetch('/api/statistics')
        .then((response) => response.json())
        .then((data) => {
          statistics.value = data
        })
        .catch((error) => {
          console.error('Error fetching statistics:', error)
        })
    }

    fetchData()

    function redFlagRepository(repositoryId) {
      fetch('/api/redFlagRepository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositoryId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Red-flagged repository:', data)

          // remove the red-flagged repository's PRs from the list
          prs.value = prs.value.filter(
            (pr) => pr.repository._id !== repositoryId
          )
        })
        .catch((error) => {
          console.error('Error red-flagging repository:', error)
        })
    }

    return {
      users,
      colleges,
      owners,
      repositories,
      prs,

      redFlagRepository,
      statistics,
    }
  },
}).mount('#app')
