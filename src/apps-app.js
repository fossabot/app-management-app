if (process.env.NODE_ENV !== 'production') {
    require('../dev-jquery-auth.js');
}

// Third party
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import log from 'loglevel';

import installedAppStore from './stores/installedApp.store';

import injectTapEventPlugin from 'react-tap-event-plugin'; injectTapEventPlugin();

// D2 / D2-UI
import D2Library from 'd2/lib/d2';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

// Components
import App from './components/App.component';

require('../scss/style.scss');

log.setLevel(process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE);

D2Library.getManifest(process.env.NODE_ENV === 'production' ? 'manifest.webapp' : 'dev_manifest.webapp')
    .then(manifest => {
        D2Library.config.baseUrl = `${manifest.getBaseUrl()}/api`;
        log.info(`Loading: ${manifest.name} v${manifest.version}`);
        log.info(`Built ${manifest.manifest_generated_at}`);
    })
    .then(D2Library.getUserSettings)
    .then(userSettings => {
        if (userSettings.uiLocale !== 'en') {
            D2Library.config.i18n.sources.add(`i18n/i18n_module_${userSettings.uiLocale}.properties`);
        }
        D2Library.config.i18n.sources.add('i18n/i18n_module_en.properties');
    })
    .then(D2Library.init)
    .then(d2 => {
        log.debug('D2 initialized', d2);
        installedAppStore.setState(d2.system.installedApps);
        ReactDOM.render(
            <App d2={d2} />,
            document.getElementById('app')
        );
    })
    .catch(error => {
        ReactDOM.render((<div>Failed to initialise D2: {error}</div>), document.getElementById('app'));
    });

ReactDOM.render(<LoadingMask />, document.getElementById('app'));
