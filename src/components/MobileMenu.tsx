import * as React from 'react'
import { MarkdownRemark, Step } from '../types'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import * as cn from 'classnames'
import Sidebar from './Tutorials/Sidebar'

interface Props {
  steps: { [key: string]: Step[] }
  post?: MarkdownRemark
  location: any
}

interface State {
  menuOpen: boolean
}

export default class MobileMenu extends React.Component<Props, State> {
  private sidebarRef: void | HTMLElement

  constructor(props) {
    super(props)

    this.state = {
      menuOpen: false,
    }
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks()
  }

  render() {
    const { menuOpen } = this.state
    const { steps, location } = this.props

    if (location.pathname === '/') {
      return null
    }

    return (
      <div className="mobile-menu">
        <style jsx={true}>{`
          .mobile-menu {
            @p: .fixed, .right0, .top0;
            z-index: 10200;
          }
          .hamburger {
            @p: .bgWhite, .pointer;
            padding: 16px;
            padding-top: 18px;
          }
          .menu-overlay {
            @p: .fixed, .top0, .left0, .right0, .bottom0, .o0;
            pointer-events: none;
            background-color: #F5F5F5;
            transition: opacity .25s ease-in-out;
          }
          .menu-overlay.visible {
            @p: .o100;
            pointer-events: all;
          }
          .menu-overlay :global(.sidebar-container) {
            @p: .flex;
          }
          .oval {
            @p: .brPill, .absolute, .z2, .pointer;
            background-color: rgba(0, 0, 0, .03);
            top: -790px;
            right: -290px;
            width: 481px;
            height: 909px;
            transform: rotate(-9deg);
          }
          .close {
            @p: .absolute, .top0, .right0, .pa25, .z2;
          }
          @media (min-width: 1051px) {
            .mobile-menu {
              @p: .dn;
            }
          }
          .mobile-menu :global(.sidebar) {
            height: 100vh;
            width: 100vw;
            padding-right: 25px;
          }
        `}</style>
        <div className="hamburger" onClick={this.toggleMenu}>
          <Icon
            src={require('../assets/icons/hamburger.svg')}
            width={7}
            height={33}
          />
        </div>
        <div className={cn('menu-overlay', { visible: menuOpen })}>
          <Sidebar
            steps={steps}
            location={location}
            post={this.props.post}
            onClickLink={this.toggleMenu}
            onRef={this.setSidebarRef}
          />
          <div className="oval" onClick={this.toggleMenu} />
          <div className="close" onClick={this.toggleMenu}>
            <Icon
              src={require('graphcool-styles/icons/stroke/cross.svg')}
              width={15}
              height={15}
              color={'#B2B2B2'}
              stroke={true}
              strokeWidth={6}
            />
          </div>
        </div>
      </div>
    )
  }

  private setSidebarRef = ref => {
    this.sidebarRef = ref
    if (this.state.menuOpen) {
      disableBodyScroll(this.sidebarRef)
    } else {
      enableBodyScroll(this.sidebarRef)
    }
  }

  private toggleMenu = () => {
    this.setState(
      state => ({ menuOpen: !state.menuOpen }),
      () => {
        if (this.sidebarRef) {
          if (this.state.menuOpen) {
            disableBodyScroll(this.sidebarRef)
          } else {
            enableBodyScroll(this.sidebarRef)
          }
        }
      }
    )
  }
}
