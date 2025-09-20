document.getElementById('image').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const preview = document.getElementById('preview');
    const fileName = document.getElementById('file-name');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
  
    if (file) {
      fileName.textContent = file.name;
      const reader = new FileReader();
  
      reader.onload = function(e) {
        preview.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
    }
  });
  
  document.getElementById('movie-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    fetch('/add', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.ok) {
        window.location.href = '/'; // Redirect to home after success
      } else {
        alert('Failed to submit form');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error submitting form');
    });
  });
  