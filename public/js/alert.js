function alertAnimation() {
    try{
        const alert = $('.alert')
        alert.css('right', alert.width);
        alert.css('transition', "right 2s");
        alert.css('right', "0");

        const bsAlert = new bootstrap.Alert('.alert');
        setTimeout(() => {
            bsAlert.close();
        }, 7000)
    }catch (err) {
        console.log(err)
    }

}
