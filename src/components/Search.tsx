import * as React from 'react'

export default function Search() {
  return (
    <div className="search">
      <style jsx={true}>{`
        .search {
          @p: .flex, .itemsCenter;
        }
        input {
          @p: .f14;
          border: none;
        }
      `}</style>
      <input type="text" placeholder="Search tutorials..." />
    </div>
  )
}
