window.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    feedbackForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const feedbackData = document.getElementById('feedbackData');
        fetch('/api/userFeedback', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': Cookies.get('XSRF-TOKEN'),
            },
            body: JSON.stringify({
                feedbackData: feedbackData.value,
            }),
        }).then(() => {
            window.location.href = '/main/index';
        });
    });
});
