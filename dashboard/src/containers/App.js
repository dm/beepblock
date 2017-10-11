import React from 'react'
import GridContainer from '../components/GridContainer'
import GridItem from '../components/GridItem'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BuySell from './BuySell'
import Generation from './Generation'
import Consume from './Consume'
import Battery from './Battery'

const App = (props) => {

  return (
    <GridContainer rowTemplate='1fr 6fr 1fr'
      columnTemplate={`2fr 1fr 1fr 1fr`}
      style={{ textAlign: 'center', height: '100%'}}>

      <GridItem columns='1 / 5' rows='1 / 2' style={{ backgroundColor: 'red'}} >
        <Header />
      </GridItem>

      <GridItem columns='1 / 2' rows='2 / 3' style={{ backgroundColor: 'blue'}}>
        <BuySell />
      </GridItem>
      <GridItem columns='2 / 3' rows='2 / 3' style={{ backgroundColor: 'green'}}>
        <Generation />
      </GridItem>
      <GridItem columns='3 / 4' rows='2 / 3' style={{ backgroundColor: 'yellow'}}>
        <Consume />
      </GridItem>
      <GridItem columns='4 / 5' rows='2 / 3' style={{ backgroundColor: 'pink'}}>
        <Battery />
      </GridItem>

      <GridItem columns='1 / 5' rows='3 / 4' style={{ backgroundColor: 'grey'}}>
        <Footer />
      </GridItem>
    </GridContainer>
  );

}

export default App;