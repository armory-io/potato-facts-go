import { Card, Text, MediaQuery } from '@mantine/core'
import potato from './assets/potato.png'
import { useMediaQuery } from '@mantine/hooks'
import { renderIf, renderIfOrElse } from './componentUtils'

export const FactOfTheMoment = ({ fact }: { fact?: string }) => {
  const isSmallScreen = useMediaQuery('(max-width: 750px)')
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
      {renderIf(
        !isSmallScreen,
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
      )}
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
        {renderIfOrElse(
          isSmallScreen,
          <div>
            <Text size="lg" weight={'bold'} align={'center'}>
              Potato Fact of the Moment
            </Text>
            <Text size="md" align={'center'}>
              {fact}
            </Text>
          </div>,
          <div>
            <Text size="xl" weight={'bold'} align={'center'}>
              Potato Fact of the Moment
            </Text>
            <Text size="lg" align={'center'}>
              {fact}
            </Text>
          </div>
        )}
      </div>
      {renderIf(
        !isSmallScreen,
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
      )}
    </Card>
  )
}
