import { Card, Text } from '@mantine/core'
import potato from './assets/potato.png'

export const FactOfTheMoment = ({ fact }: { fact?: string }) => {
  return (
    <Card
      style={{
        display: 'flex',
        width: '100%'
      }}
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
    >
      <img
        style={{
          height: '100px',
          marginRight: '20px',
          marginLeft: '5px'
        }}
        src={potato}
        className="img potato"
        alt="potato img"
      />
      <div
        style={{
          width: '100%',
          paddingTop: '0px',
          display: 'flex',
          justifyContent: 'center',
          flexFlow: 'column',
          marginTop: '-5px'
        }}
      >
        <Text size="xl" weight={'bold'} align={'center'}>
          Potato Fact of the Moment
        </Text>
        <Text size="lg" align={'center'}>
          {fact}
        </Text>
      </div>
      <img
        style={{
          height: '100px',
          marginLeft: '20px',
          marginRight: '5px'
        }}
        src={potato}
        className="img potato"
        alt="potato img"
      />
    </Card>
  )
}
