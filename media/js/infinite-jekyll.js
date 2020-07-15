$(function () {

	var articleURLs,
		isFetchingPosts = false,
		shouldFetchPosts = true,
		postsToLoad = $(".article-list").children().length,
		loadNewPostsThreshold = 3000;

	// Load the JSON file containing all URLs
	$.getJSON('articles.json', function (data) {
		const section = document.querySelector('section');
		if (!section || !section.dataset || !section.dataset.section) {
			disableFetching();
		}
		articleURLs = data[section.dataset.section]; //load articles for active section

		console.log('debug: articleURLs.length', articleURLs.length);
		console.log('debug: postsToLoad', postsToLoad);
		// If there aren't any more posts available to load than already visible, disable fetching
		if (articleURLs.length <= postsToLoad)
			disableFetching();
	});

	// If there's no spinner, it's not a page where posts should be fetched
	if ($(".infinite-spinner").length < 1)
		shouldFetchPosts = false;

	// Are we close to the end of the page? If we are, load more posts
	$(window).scroll(function (e) {
		if (!shouldFetchPosts || isFetchingPosts) return;

		var windowHeight = $(window).height(),
			windowScrollPosition = $(window).scrollTop(),
			bottomScrollPosition = windowHeight + windowScrollPosition,
			documentHeight = $(document).height();

		// If we've scrolled past the loadNewPostsThreshold, fetch posts
		if ((documentHeight - loadNewPostsThreshold) < bottomScrollPosition) {
			fetchPosts();
		}
	});

	// Fetch a chunk of posts
	function fetchPosts() {
		// Exit if articleURLs haven't been loaded
		if (!articleURLs) return;

		isFetchingPosts = true;

		// Load as many posts as there were present on the page when it loaded
		// After successfully loading a post, load the next one
		var loadedPosts = 0,
			postCount = $(".article-list").children().length,
			callback = function () {
				loadedPosts++;
				var postIndex = postCount + loadedPosts;

				if (postIndex > articleURLs.length - 1) {
					disableFetching();
					return;
				}

				if (loadedPosts < postsToLoad) {
					fetchPostWithIndex(postIndex, callback);
				} else {
					isFetchingPosts = false;
				}
			};

		fetchPostWithIndex(postCount + loadedPosts, callback);
	}

	function fetchPostWithIndex(index, callback) {
		var articleURL = articleURLs[index];

		$.get(articleURL, function (data) {
			$(data).filter(".article").appendTo(".article-list");
			callback();
		});
	}

	function disableFetching() {
		shouldFetchPosts = false;
		isFetchingPosts = false;
		$(".infinite-spinner").fadeOut();
	}

});