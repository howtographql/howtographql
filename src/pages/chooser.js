import React from 'react'
import {Icon} from 'graphcool-styles'

import '../styles/reset.css'
import '../styles/main.css'

export default () => (
  <div>
    <style jsx={true}>{`
      h1 {
        @p: .f38, .ma0, .white;
      }

      img {
        @p: .mh25;
        height: 40px !important;
        width: auto !important;
      }

      div {
        @p: .pa38, .bgDarkBlue;
      }
    `}</style>
    <h1>Chooser</h1>
    <img src={require('../assets/icons/vue.svg')} />
    <img src={require('../assets/icons/react.svg')} />
    <img src={require('../assets/icons/apollo.svg')} />
    <img src={require('../assets/icons/nodejs.svg')} />
    <img src={require('../assets/icons/graphcool.svg')} />
    <img src={require('../assets/icons/sangria.svg')} />
    <img src={require('../assets/icons/sangria_bw.svg')} />
  </div>
)