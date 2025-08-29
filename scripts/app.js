const API_KEY = 'AIzaSyAnywD3gTrJ3IVKuo7gRZt9SrT88I-rY_Y';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/';

//DOM elements
const searchForm = document.getElementById('searchForm');
const channelInput = document.getElementById('channelInput');
const channelInfo = document.getElementById('channelInfo');
const videoGrid = document.getElementById('videosGrid');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
// const videoPlayerSection = document.getElementById('')

let currentChannelData = null;
let currentVideosData = [];

//form submission event listener
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const channelName = channelInput.value.trim();

    if (channelName) {
        //clear previous result
        clearResults();

        //show loading state
        loading.style.display = 'block';

        //fetch channel data
        searchChannel(channelName);
    }
});

async function searchChannel(channelName) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelName)}&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    console.log(searchResponse);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
        throw new Error(searchData.error?.message || 'Failed to search for channel.');
    }

    if (!searchData.items || searchData.items.length === 0) {
        throw new Error('No channel found with that name.');
    }

    // get first channel result
    const channelId = searchData.items[0].snippet.channelId;
    const channelTitle = searchData.items[0].snippet.channelTitle;
    const thumbnail = searchData.items[0].snippet.thumbnails.medium.url;

    //get detailed channel statistics
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${API_KEY}`;

    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelResponse.ok) {
        throw new Error(channelData.error?.message ||
            'Failed to fetch channerl details');
    }

    if (!channelData.items || channelData.items.length === 0) {
        throw new Error('No channel details found');
    }

    //store channel data
    currentChannelData = {
        ...channelData.items[0],
        thumbnail: thumbnail
    }

    //displayChannelInfo
    displayChannelInfo(currentChannelData);
}

function displayChannelInfo(channel) {
    loading.style.display = 'none';
    const stats = channel.statistics;
    const formatNumber = num => parseInt(num).toLocaleString();

    channelInfo.innerHTML = `
        <div class="channel-thumbnail">
            <img src="${channel.thumbnail}" alt="${channel.snippet.title}">
        </div>
        <div class="channel-details">
            <h2>${channel.snippet.title}</h2>
            <p>${channel.snippet.description || 'No description available'}</p>
            <div class="channel-stats">
                <div class="stat">
                    <div class="stat-number">${formatNumber(stats.subscriberCount)}</div>
                    <div class="stat-label">Subscribers</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${formatNumber(stats.videoCount)}</div>
                    <div class="stat-label">Videos</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${formatNumber(stats.viewCount)}</div>
                    <div class="stat-label">Views</div>
                </div>
            </div>
        </div>
    `;

    channelInfo.style.display = 'grid';
}

function clearResults() {
    channelInfo.style.display = 'none';
    videoGrid.innerHTML = '';
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    currentChannelData = null;
    currentVideosData = [];
}