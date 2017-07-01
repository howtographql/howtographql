import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import { EventHandler, SyntheticEvent } from 'react'
import * as cn from 'classnames'

interface Props {
  onChange: any
  onFocus: EventHandler<SyntheticEvent<any>>
  onBlur: EventHandler<SyntheticEvent<any>>
  query: string
  focused?: boolean
}

export default class SearchInput extends React.Component<Props, {}> {
  render() {
    const { onFocus, onBlur, query, focused } = this.props
    return (
      <div className={cn('search-input', { focused })}>
        <style jsx={true}>{`
          .search-input {
            @p: .z2, .relative;
            transition: transform ease-in-out 0.15s;
          }
          .input {
            @p: .relative, .flex, .itemsCenter;
          }
          input {
            @p: .f14, .black80, .ml6, .pl38, .pv16, .pr25, .relative, .z1;
            background: none;
            border: none;
          }
          @media (min-width: 1200px) {
            input {
              min-width: 300px;
            }
          }
          label {
            @p: .flex, .itemsCenter, .pa10;
          }
          input::placeholder {
            @p: .black40;
          }
          .icon {
            @p: .absolute;
            left: 20px;
          }
          @media (max-width: 1050px) {
            .search-input {
              transform: translateX(calc(100vw - 44px));
              background: white;
            }
            .search-input.focused {
              transform: translateX(10px);
            }
            div.icon {
              left: 10px;
            }
          }
        `}</style>
        <div className="input">
          <div className="icon">
            <Icon
              src={require('graphcool-styles/icons/stroke/search.svg')}
              stroke={true}
              strokeWidth={4}
              width={14}
              height={14}
              color={$v.gray30}
            />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search tutorials..."
            value={query}
            onChange={this.handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
    )
  }

  private handleChange = e => {
    this.props.onChange(e.target.value)
  }
}
