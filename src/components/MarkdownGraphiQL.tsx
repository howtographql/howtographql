import * as React from 'react'
// import * as GraphiQL from 'graphiql'
import { CustomGraphiQL } from 'graphcool-graphiql'
import * as cx from 'classnames'
import * as frontmatter from 'front-matter'
import '../styles/graphiql-light.css'

interface Props {
  literal: string
  playground?: boolean
  onExecuteQuery?: () => void
  showSchema?: boolean
  schemaIdl?: string
  schemaModelName?: string
  selectedEndpoint?: Endpoint
  onChangeEndpoint?: (endpoint: Endpoint) => void
  schema?: any
  disableResize?: boolean
  disableQueryHeader?: boolean
}

export type Endpoint = 'SIMPLE' | 'RELAY'

interface State {
  query: string
  response: string
  variables: string
}

interface DSL {
  disabled: boolean
  endpoint: string
  query: string
  data: string
  variables: string | null
}

interface Frontmatter {
  attributes: { [key: string]: any }
  body: string
}

function parseDSL(literal: string): DSL {
  const fm: Frontmatter = frontmatter(literal)

  const [queryPart, a, b] = fm.body.split('---')

  let dataPart: string
  let variablesPart: string | null = null

  if (b) {
    dataPart = b
    variablesPart = a
  } else {
    dataPart = a
  }

  return {
    data: dataPart.trim(),
    disabled: fm.attributes.disabled || false,
    endpoint: fm.attributes.endpoint,
    query: queryPart.trim(),
    variables: variablesPart ? variablesPart.trim() : null,
  }
}

export function dslValid(literal: string): boolean {
  const fm: Frontmatter = frontmatter(literal)

  if (fm.body.split('---').length < 2) {
    return false
  }

  if (!fm.attributes.disabled && !fm.attributes.endpoint) {
    return false
  }

  return true
}

export function getVariables(literal: string): string {
  const fm: Frontmatter = frontmatter(literal)
  const components = fm.body.split('---')
  return components[1]
}

export function getGraphQLCode(literal: string): string {
  const fm: Frontmatter = frontmatter(literal)
  const components = fm.body.split('---')
  return components[0]
}

interface GraphQLParams {
  query: string
  variables: {}
}

export default class MarkdownGraphiQL extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = this.getDSL(props.literal)
  }

  getDSL(literal): State {
    const dsl = parseDSL(literal)
    return {
      query: dsl.query,
      response: dsl.data,
      variables: dsl.variables || '',
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.literal !== this.props.literal) {
      this.setState(this.getDSL(nextProps.literal))
    }
  }

  render() {
    const dsl = parseDSL(this.props.literal)

    const graphQLFetcher = (graphQLParams: GraphQLParams) => {
      if (dsl.disabled && !graphQLParams.query.includes('IntrospectionQuery')) {
        return JSON.parse(dsl.data)
      }

      if (typeof this.props.onExecuteQuery === 'function') {
        this.props.onExecuteQuery()
      }

      if (!graphQLParams.query.includes('IntrospectionQuery')) {
        this.setState(
          {
            query: graphQLParams.query,
            variables: JSON.stringify(graphQLParams.variables),
          } as any,
        )
      }

      return fetch(dsl.endpoint, {
        body: JSON.stringify(graphQLParams),
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
      }).then(res => res.json())
    }

    const { playground, showSchema, schemaModelName, schemaIdl } = this.props

    return (
      <div
        className={cx('container', {
          disabled: dsl.disabled,
          'graphiql-light': !playground,
          playground,
        })}
      >
        <CustomGraphiQL
          selectedEndpoint={this.props.selectedEndpoint || 'SIMPLE'}
          showEndpoints={true}
          onChangeEndpoint={this.props.onChangeEndpoint}
          fetcher={graphQLFetcher}
          query={this.state.query}
          variables={this.state.variables}
          onEditQuery={this.handleEditQuery}
          showQueryTitle={!playground}
          showResponseTitle={!playground}
          showSchema={showSchema}
          schemaIdl={schemaIdl}
          schemaModelName={schemaModelName}
          disableAutofocus={true}
          schema={this.props.schema}
          disableResize={this.props.disableResize}
          rerenderQuery={true}
          disableQueryHeader={this.props.disableQueryHeader}
        />
      </div>
    )
  }

  private handleEditQuery = (query: string) => this.setState({ query } as any)
}
