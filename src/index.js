import 'console-info';
import 'console-warn';
import 'console-error';
import App from 'core/App';
import ETH from 'core/Web3';

(() => {
    new ETH();
    new App();
})();

