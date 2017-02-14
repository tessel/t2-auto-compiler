((global) => {
  const { fetch, DOMParser } = global
  function fetchDirectoryList (bucket, prefix) {
    if (!bucket) {
      throw TypeError('"bucket" is required')
    }
    if (prefix === undefined) {
      prefix = ''
    }

    const url = `https://s3.amazonaws.com/${bucket}`

    return fetch(`${url}?list-type=2&prefix=${encodeURIComponent(prefix)}`)
      .then(response => {
        return response.text()
          .then(xml => {
            const parser = new DOMParser()
            return parser.parseFromString(xml, response.headers.get('Content-Type'))
          })
      })
      .then(xml => {
        const nodes = Array.from(xml.getElementsByTagName('Contents'))
        return nodes.map(item => {
          const key = item.getElementsByTagName('Key')[0].innerHTML
          const path = `${url}/${key}`
          const parts = key.split('/')
          const name = parts[2].slice(0, -5)
          return {
            path,
            name
          }
        })
      })
  }

  const search = (bucket, resultsDiv) => search => {
    return fetchDirectoryList(bucket, search)
      .then(list => {
        resultsDiv.innerHTML = JSON.stringify(list.map(i => i.name), null, 2)
      })
  }

  function liveSearch ({ searchBoxId, resultsDivId, bucket, prefix, selectorId }) {
    const searchBox = document.getElementById(searchBoxId)
    const resultsDiv = document.getElementById(resultsDivId)
    const selectorDiv = document.getElementById(selectorId)

    const searchFunc = search(bucket, resultsDiv)

    let packageType = selectorDiv.value
    let query = searchBox.value

    selectorDiv.addEventListener('input', ({ target: { value } }) => {
      packageType = value
      searchFunc(`${prefix}${packageType}/${query}`)
    })

    searchBox.addEventListener('input', ({ target: { value } }) => {
      query = value
      searchFunc(`${prefix}${packageType}/${query}`)
    })

    searchFunc(`${prefix}${packageType}/${query}`)
  }

  [
    fetchDirectoryList,
    liveSearch
  ].forEach(func => { window[func.name] = func })
})(this)
