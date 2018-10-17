import 'babel-polyfill';
import 'console-info';
import 'console-warn';
import 'console-error';
import App from 'core/App';
import ETH from 'core/Web3';

/*eslint-disable */
process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
    // if you are on production, maybe you can send the exception details to your
    // email as well ?
});
/*eslint-enable */
(() => {
    /*eslint-disable */
    // const COMMITHASH = 'debug';
    console.info(`Web3_Proxy ver. ${COMMITHASH}`);
    /*eslint-enable */
    new ETH();
    new App();
})();

