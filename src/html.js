import React from "react"

let stylesStr
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw-loader!../public/styles.css`)
  } catch (e) {
    console.log(e)
  }
}

module.exports = class Html extends React.Component {
  render() {
    console.log(this.props)
    let css
    if (process.env.NODE_ENV === `production`) {
      css = (
        <style
          id="gatsby-inlined-css"
          dangerouslySetInnerHTML={{ __html: stylesStr }}
        />
      )
    }
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,700" rel="stylesheet" />
        <link
          key={`gatsby-plugin-sitemap`}
          rel="sitemap"
          type="application/xml"
          href="/sitemap.xml"
        />
        {typeof window !== 'undefined' && (<link rel="alernate" href={window.location.href} hreflang="en-us" />)}
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e00083" />
        {this.props.headComponents}
        {css}
      </head>
      <body>
      {this.props.preBodyComponents}
      <div
        id="___gatsby"
        dangerouslySetInnerHTML={{ __html: this.props.body }}
      />
      {this.props.postBodyComponents}
      </body>
      <script
        key="google-analytics"
        dangerouslySetInnerHTML={{ __html: `
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-74131346-11', 'auto');
        ga(u => u.set('sendHitTask', model => {
          fetch('https://ga.graph.cool', {
            method: 'POST',
            body: model.get('hitPayload'),
            mode: 'no-cors',
          })
        }))
        ga('send', 'pageview');
        ` }}
      >
      </script>
      <script src="https://cdn.ravenjs.com/3.16.1/raven.min.js" crossorigin="anonymous">
      </script>
      </html>
    )
  }
}
