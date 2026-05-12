document.addEventListener('DOMContentLoaded', function() {
  var currentFile = window.location.pathname.split('/').pop();

  fetch('../blog/blogs.json')
    .then(function(r) { return r.json(); })
    .then(function(blogs) {
      var idx = blogs.findIndex(function(b) { return b.file === currentFile; });
      if (idx === -1) return;

      var prev = idx > 0 ? blogs[idx - 1] : null;
      var next = idx < blogs.length - 1 ? blogs[idx + 1] : null;

      var nav = document.getElementById('blog-post-nav');
      if (!nav) return;

      nav.innerHTML =
        '<div class="blog-post-nav-inner">' +
          (prev
            ? '<a href="' + prev.file + '" class="blog-nav-btn blog-nav-prev">' +
                '<span class="blog-nav-arrow">&#8592;</span>' +
                '<span class="blog-nav-label"><span class="blog-nav-hint">Previous</span>' +
                '<span class="blog-nav-title">' + prev.title + '</span></span>' +
              '</a>'
            : '<span class="blog-nav-btn blog-nav-prev blog-nav-disabled"></span>'
          ) +
          '<a href="../index.html#blog" class="blog-nav-all">All Posts</a>' +
          (next
            ? '<a href="' + next.file + '" class="blog-nav-btn blog-nav-next">' +
                '<span class="blog-nav-label"><span class="blog-nav-hint">Next</span>' +
                '<span class="blog-nav-title">' + next.title + '</span></span>' +
                '<span class="blog-nav-arrow">&#8594;</span>' +
              '</a>'
            : '<span class="blog-nav-btn blog-nav-next blog-nav-disabled"></span>'
          ) +
        '</div>';
    });
});
