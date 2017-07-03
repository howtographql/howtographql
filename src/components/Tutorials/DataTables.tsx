import * as React from 'react'

interface Props {
  personData: Array<{ [key: string]: any }>
  postData: Array<{ [key: string]: any }>
}

export default function DataTables({ personData, postData }: Props) {
  return (
    <div className="data-tables">
      <style jsx={true}>{`
        .data-tables {
          @p: .pa25, .bgDarkBlue04, .br2, .ba, .bDarkBlue10, .flex;
          margin-left: 3px;
          margin-right: 3px;
        }
      `}</style>
      <Table title="Person" data={personData} />
      <Table title="Post" data={postData} />
    </div>
  )
}

interface TableProps {
  title: string
  data: Array<{ [key: string]: any }>
}

function Table({ title, data }: TableProps) {
  return (
    <div className="table">
      <style jsx={true}>{`
        .table + .table {
          @p: .ml25;
        }
        .table {
          @p: .bgWhite, .br2, .overlayShadow;
        }
        .head {
          background: $darkBlue06;
        }
        .row {
          @p: .flex, .bb, .bDarkBlue10;
        }
        .row:last-of-type {
          border: none;
        }
        .cell {
          @p: .pv10, .ph12, .f12;
          width: 100px;
        }
        .title {
          @p: .darkBlue, .f20, .fw6, .ma6, .pl4;
        }
      `}</style>
      <div className="title">{title}</div>
      {data.length > 0 &&
        <div className="row head">
          {Object.keys(data[0]).map(field =>
            <div className="cell" style={{ width: getCellWidth(field) }}>
              {field}
            </div>,
          )}
        </div>}
      {data.length > 0 &&
        data.map(date =>
          <div className="row">
            {Object.keys(date).map(field =>
              <div className="cell" style={{ width: getCellWidth(field) }}>
                {date[field]}
              </div>,
            )}
          </div>,
        )}
    </div>
  )
}

function getCellWidth(field: string) {
  if (field === 'id') {
    return 180
  }
  if (field === 'title') {
    return 180
  }
  return 50
}

// const schema = `type Post {
//   title: String!
//   author: Person! @relation(name: "UserPosts")
// }
//
// type Person {
//   name: String!
//   age: Int!
//   posts: [Post!]! @relation(name: "UserPosts")
// }`
