fetch('blog/blogs.json')
  .then(function(r) { return r.json(); })
  .then(function(blogs) {
    var row = document.getElementById('blog-cards-row');
    if (!row) return;

    blogs.forEach(function(blog) {
      var tags = (blog.tags || [])
        .map(function(t) { return '<span class="blog-tag">' + t + '</span>'; })
        .join('');

      var col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML =
        '<div class="card mb-4 shadow-sm h-100">' +
          '<div class="card-body text-left d-flex flex-column">' +
            '<div class="mb-2">' + tags + '</div>' +
            '<h5 class="card-title">' + blog.title + '</h5>' +
            '<p class="card-text text-muted" style="font-size:0.85rem;">' +
              blog.date + ' &nbsp;&middot;&nbsp; ' + blog.readTime +
            '</p>' +
            '<p class="card-text flex-grow-1">' + blog.description + '</p>' +
            '<a href="blog/' + blog.file + '" class="btn btn-outline-primary btn-sm mt-2 align-self-start">Read More</a>' +
          '</div>' +
        '</div>';
      row.appendChild(col);
    });
  });
