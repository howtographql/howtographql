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
        input {
          @p: .f14, .black80, .ml6;
          border: none;
        }
        label {
          @p: .flex, .itemsCenter, .pa10;
        }
        input::placeholder {
          @p: .black30;
        }
      `}</style>
      <label htmlFor="search">
        <Icon
          src={require('graphcool-styles/icons/stroke/search.svg')}
          stroke={true}
          strokeWidth={4}
          width={14}
          height={14}
          color={$v.gray30}
        />
        <input type="text" name="search" placeholder="Search tutorials..." />
      </label>
    </div>
  )
}
