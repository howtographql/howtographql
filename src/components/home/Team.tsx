import * as React from 'react'
import Bubble from './Bubble'
import Company from './Company'
import { $v } from 'graphcool-styles'

export default function Team() {
  return (
    <section>
      <style jsx={true}>{`
        section {
          @p: .pb96, .relative, .z0;
          background-color: #fafafa;
          border-top: 2px solid rgba(0, 0, 0, 0.1);
        }
        .team {
          @p: .center;
          max-width: 1100px;
        }
        p {
          @p: .tc, .mt38;
        }
        .bubbles {
          @p: .mt60, .flex, .flexWrap;
        }
        @media (max-width: 1100px) {
          section {
            padding-bottom: 0 !important;
          }
          .bubbles-container {
            overflow-x: scroll;
            -webkit-overflow-scrolling: touch;
            padding-left: 30px;
            padding-bottom: 38px;
            margin-bottom: -180px;
          }
          div.bubbles {
            min-width: 1020px;
            transform: scale(0.7);
            transform-origin: top left;
          }
          h2, p {
            padding-left: 30px;
            padding-right: 30px;
          }
          p {
            text-align: left !important;
          }
        }
      `}</style>
      <div className="team">
        <h2>For the Community, by the Community</h2>
        <p>
          How to GraphQL was created by Prisma and many amazing contributors.
          It's open-source and free of charge.
        </p>
        <div className="bubbles-container">
          <div className="bubbles">
            <div className='flex'>
              <Bubble
                avatar={require('../../assets/graphics/contributors/brent.jpg')}
                name="Brent Vatne"
                description="Expo"
                x={0}
                y={0}
              />
              <Company
                src={require('../../assets/icons/companies/prisma.svg')}
                color={$v.white}
                y={90}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/radoslav.jpg')}
                name="Radoslav Stankov"
                description="graphql-ruby"
                x={0}
                y={-30}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/ben.jpg')}
                name="Ben Wilson"
                description="graphql-elixir"
                x={0}
                y={60}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/lee.jpg')}
                name="Lee Byron"
                description="Advisor & Feedback"
                x={0}
                y={-30}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/jonatas.jpg')}
                name="Jonatas Baldin"
                description="graphene"
                x={0}
                y={20}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/abhi.jpg')}
                name="Abhi Aiyer"
                description="Videos"
                x={-20}
                y={140}
                diameter={120}
              />
            </div>

            <div style={{ marginTop: '40px', display: 'flex' }}>
              <Bubble
                avatar={require('../../assets/graphics/contributors/sashko.jpg')}
                name="Sashko"
                description="GraphQL Server & Tooling"
                x={0}
                y={0}
                diameter={120}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/nikolas.jpg')}
                name="Nikolas Burk"
                description="GraphQL Introduction, Relay, Apollo"
                x={0}
                y={50}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/bruce.jpg')}
                name="Bruce Williams"
                description="graphql-elixir"
                x={0}
                y={-20}
              />
              <Company
                src={require('../../assets/icons/companies/expo.svg')}
                color="#0068B3"
                y={90}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/maira.png')}
                name="Maira Bello"
                description="graphql.js"
                x={0}
                y={-30}
              />
              <Company
                src={require('../../assets/icons/companies/producthunt.svg')}
                color="#DA552F"
                y={30}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/nilan.jpg')}
                name="Nilan Marktanner"
                description="Reviews & Feedback"
                x={0}
                y={100}
                diameter={120}
              />
            </div>

            <div style={{ marginTop: '40px', display: 'flex', marginLeft: 60 }}>
              <Company
                src={require('graphcool-styles/icons/fill/apolloLogoCentered.svg')}
                color="#22A699"
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/bojan.jpg')}
                name="Bojan Tomić"
                description="graphql-java"
                x={0}
                y={30}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/johannes.jpg')}
                name="Johannes Schickling"
                description="Organization"
                x={0}
                y={-20}
                diameter={120}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/tim.jpg')}
                name="Tim Suchanek"
                description="Website implementation"
                x={0}
                y={40}
                diameter={120}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/julian.png')}
                name="Julian Bauer"
                description="Design"
                x={0}
                y={-40}
                diameter={120}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/christian.jpg')}
                name="Christian Joudrey"
                description="Reviews & Feedback"
                x={30}
                y={-30}
                diameter={120}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/marcandre.jpg')}
                name="Marc-André Giroux"
                description="Tooling and Ecosystem, Security"
                x={20}
                y={50}
                diameter={120}
              />
            </div>

            <div style={{ marginTop: '40px', display: 'flex', marginLeft: 60 }}>

              <Bubble
                avatar={require('../../assets/graphics/contributors/matt.jpg')}
                name="Matt Dionis"
                description="vue-apollo"
                x={0}
                y={-50}
              />
              <Company
                src={require('../../assets/icons/companies/facebook.svg')}
                color="#0068B3"
                x={125}
                y={-20}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/devan.jpg')}
                name="Devan Beitel"
                description="ember-apollo"
                x={350}
                y={-70}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/bouba.jpg')}
                name="Boubacar Barry"
                description="angular-apollo"
                x={0}
                y={0}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/marioosh.jpg')}
                name="Mariusz Nosiński"
                description={"Sangria - Scala"}
                x={170}
                y={-10}
              />
              <Bubble
                avatar={require('../../assets/graphics/contributors/robin.png')}
                name="Robin MacPherson"
                description={"graphql.js"}
                x={170}
                y={-10}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
