import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'

export default function Search() {
  return (
    <div className="search">
      <style jsx={true}>{`
        .search {
          @p: .ml38;
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
          @p: .black30;
        }
        .search .icon {
          @p: .absolute;
          left: 20px;
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
        <input type="text" name="search" placeholder="Search tutorials..." />
      </div>
    </div>
  )
}
