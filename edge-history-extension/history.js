const resultsBody = document.getElementById('resultsBody');
const searchBtn = document.getElementById('searchBtn');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const deleteAllBtn = document.getElementById('deleteAll');
let currentResults = [];
let lastChecked = null;

function escapeRegExp(str) {
  return str.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function wildcardToRegExp(pattern) {
  const escaped = escapeRegExp(pattern);
  return new RegExp('^' + escaped.split('*').join('.*') + '$', 'i');
}

function addShiftClick(checkbox) {
  checkbox.addEventListener('click', (e) => {
    if (!lastChecked) {
      lastChecked = checkbox;
      return;
    }
    if (e.shiftKey) {
      const boxes = Array.from(document.querySelectorAll('.history-checkbox'));
      let start = boxes.indexOf(checkbox);
      let end = boxes.indexOf(lastChecked);
      if (start > end) [start, end] = [end, start];
      for (let i = start; i <= end; i++) {
        boxes[i].checked = lastChecked.checked;
      }
    }
    lastChecked = checkbox;
  });
}

function renderResults() {
  resultsBody.innerHTML = '';
  currentResults.forEach(item => {
    const tr = document.createElement('tr');
    const tdCheck = document.createElement('td');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'history-checkbox';
    cb.dataset.url = item.url;
    addShiftClick(cb);
    tdCheck.appendChild(cb);
    tr.appendChild(tdCheck);

    const tdTitle = document.createElement('td');
    tdTitle.textContent = item.title || item.url;
    tr.appendChild(tdTitle);

    const tdUrl = document.createElement('td');
    tdUrl.textContent = item.url;
    tr.appendChild(tdUrl);

    const tdTime = document.createElement('td');
    tdTime.textContent = new Date(item.lastVisitTime).toLocaleString();
    tr.appendChild(tdTime);

    resultsBody.appendChild(tr);
  });
}

function searchHistory() {
  const text = document.getElementById('searchText').value.trim();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const query = { text: '', maxResults: 10000 };
  if (startDate) query.startTime = new Date(startDate).getTime();
  if (endDate) query.endTime = new Date(endDate).getTime();

  chrome.history.search(query, (items) => {
    let pattern = null;
    if (text) pattern = wildcardToRegExp(text);
    currentResults = items.filter(item => {
      if (!pattern) return true;
      return pattern.test(item.title || '') || pattern.test(item.url);
    });
    renderResults();
  });
}

function getSelected() {
  return Array.from(document.querySelectorAll('.history-checkbox:checked')).map(cb => cb.dataset.url);
}

function deleteSelected() {
  const urls = getSelected();
  urls.forEach(url => chrome.history.deleteUrl({ url }));
  searchHistory();
}

function deleteAll() {
  currentResults.forEach(item => chrome.history.deleteUrl({ url: item.url }));
  searchHistory();
}

searchBtn.addEventListener('click', searchHistory);
deleteSelectedBtn.addEventListener('click', deleteSelected);
deleteAllBtn.addEventListener('click', deleteAll);
