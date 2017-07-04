import * as React from 'react'
import * as cn from 'classnames'

interface Props {
  light?: boolean
  tutorial: string
}

interface State {
  sending: boolean
  sent: boolean
  email: string
}

export default class NewsletterSignup extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      sending: false,
      sent: false,
    }
  }

  renderButton() {
    const invalid = !this.emailValid()
    return (
      <button className={cn({ invalid })} onClick={this.submit}>
        <style jsx={true}>{`
          button {
            @p: .bgPink, .white, .br2, .flexFixed, .f16, .fw6, .pv10, .ph16, .pointer, .ttu, .buttonShadow;
            border: none;
          }
          button.invalid {
            cursor: not-allowed;
          }
          @media (max-width: 480px) {
            button {
              @p: .w100;
              padding-top: 16px !important;
              padding-bottom: 16px !important;
            }
          }
        `}</style>
        Stay Tuned
      </button>
    )
  }

  render() {
    const { light } = this.props
    const { sending, sent } = this.state

    if (sent) {
      return (
        <p className={cn({ light })}>
          <style jsx={true}>{`
            p {
              @p: .tc;
            }
            p.light {
              @p: .white;
            }
          `}</style>
          Thanks for signing up.
          We will inform you as soon as the tutorial is ready!
        </p>
      )
    }

    if (sending) {
      return (
        <p className={cn({ light })}>
          <style jsx={true}>{`
            p {
              @p: .white, .tc;
            }
            p.light {
              @p: .white;
            }
          `}</style>
          Signing up...
        </p>
      )
    }

    return (
      <div>
        <style jsx={true}>{`
          .newsletter-signup {
            @p: .bgWhite04, .br2, .pa10, .flex, .center;
            max-width: 512px;
          }
          input {
            @p: .f20, .w100, .pl10, .white80;
            border: none;
            background: none;
          }
          .newsletter-signup.light {
            @p: .bgWhite10;
          }
          .newsletter-signup.light input {
            @p: .white80;
          }
          p {
            @p: .tc, .mb16, .white80, .lhCopy;
          }
          @media (max-width: 580px) {
            div p {
              @p: .ph25;
            }
            div input {
              @p: .pa10, .mb10;
            }
            div.newsletter-signup {
              @p: .db;
            }
          }
        `}</style>
        <p>To get notified when this tutorial is available, sign up here</p>
        <div className={cn('newsletter-signup', { light })}>
          <input
            type="text"
            placeholder="Just type your Email"
            onChange={this.onChangeEmail}
            onKeyDown={this.onKeyDown}
          />
          {this.renderButton()}
        </div>
      </div>
    )
  }

  private onChangeEmail = e => {
    this.setState({ email: e.target.value })
  }

  private onKeyDown = e => {
    if (e.keyCode === 13) {
      this.submit()
    }
  }

  private submit = () => {
    if (this.emailValid()) {
      this.setState({ sending: true }, () => {
        const { email } = this.state
        const { tutorial } = this.props
        const mutation = `
          mutation signup($email: String!, $tutorial: String!) {
            createSignup(email: $email tutorial: $tutorial) {
              id
            }
          }
        `
        const variables = {
          email,
          tutorial,
        }
        fetch('https://api.graph.cool/simple/v1/cj4pjmqj541d501696t6bgh08', {
          body: JSON.stringify({ query: mutation, variables }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'post',
        })
          .then(res => res.json())
          .then(() => {
            this.setState({ sending: false, sent: true })
          })
      })
    }
  }

  private emailValid() {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ /* tslint:disable-line */
    return regex.test(this.state.email)
  }
}
