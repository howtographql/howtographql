import React from 'react'
import {Icon} from 'graphcool-styles'

export default () => (
  <div>
    <style jsx={true}>{`
      h1 {
        @p: .f38, .ma0, .darkBlue50;
      }
    `}</style>
    <h1>Chooser</h1>
    <img src={require('graphcool-styles/icons/fill/androidLogo.svg')} />
  </div>
)