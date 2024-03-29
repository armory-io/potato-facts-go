import 'chart.js/auto'
import { useEffect, useState } from 'react'
import { FactOfTheMoment } from './FactOfTheMoment'
import { APIMetadata } from './APIMetadata'
import { SimpleGrid, Skeleton, Card, Text } from '@mantine/core'
import { Optional } from 'typescript-optional'
import dayjs, { Dayjs } from 'dayjs'
import { useMediaQuery } from '@mantine/hooks'
import { renderIfOrElse } from './componentUtils'

const { ofNullable } = Optional

const initialPotatoFact = 'Potatoes were the first vegetable grown in space.'

function ifOkOrElse<T>(res: Response, okFn: (typedRes: T) => void, notOkFn: () => void) {
  if (res.ok) {
    res.json().then((r) => okFn(r as T))
  } else {
    notOkFn()
  }
}

export interface ApiCallMetadata {
  succeeded: boolean
  replicaSetName: string
  time: Dayjs
}

interface FactWrapper {
  fact: string
}

const FactCount = ({ count }: { count: number }) => (
  <>
    <Card style={{ display: 'flex', flexFlow: 'column', justifyContent: 'center' }}>
      <Text size="xl" weight={'bold'} align={'center'}>
        Facts Fetched
      </Text>
      <Text style={{ fontSize: '100px', fontWeight: 'bold', marginTop: '-20px' }} align={'center'}>
        {count}
      </Text>
    </Card>
  </>
)

const Placeholder = () => (
  <>
    <Skeleton visible={true}>
      <div
        style={{
          display: 'block',
          height: '250px'
        }}
      ></div>
    </Skeleton>
  </>
)

const LargeScreenLayout = ({ callMetadata }: { callMetadata: ApiCallMetadata[] }) => {
  return (
    <SimpleGrid cols={2}>
      <FactCount count={callMetadata.length} />
      <APIMetadata callMetadata={callMetadata} />
    </SimpleGrid>
  )
}

const SmallScreenLayout = ({ callMetadata }: { callMetadata: ApiCallMetadata[] }) => {
  return (
    <div>
      <SimpleGrid cols={1}>
        <APIMetadata callMetadata={callMetadata} />
        <FactCount count={callMetadata.length} />
      </SimpleGrid>
    </div>
  )
}

const App = () => {
  const [factOfTheMoment, setFactOfTheMoment] = useState<string | undefined>(initialPotatoFact)
  const [lastFactUpdate, setLastFactUpdate] = useState<Dayjs>(dayjs())
  const [pollRate, setPollRate] = useState<number>(1000)
  const [callMetadata, setCallMetadata] = useState<ApiCallMetadata[]>([])
  const isSmallScreen = useMediaQuery('(max-width: 750px)')

  useEffect(() => {
    const factPoller = setInterval(() => {
      let path = '/api/potato-fact'
      if (window.location.href.includes('prod/ui')) {
        path = '/prod/api/potato-fact'
      }
      if (window.location.href.includes('staging/ui')) {
        path = '/staging/api/potato-fact'
      }

      fetch(path).then((response) => {
        const now = dayjs()
        const replicaSetName = ofNullable(response.headers.get('X-Replica-Set-Name'))
        ifOkOrElse<FactWrapper>(
          response,
          (res) => {
            callMetadata.push({
              succeeded: true,
              replicaSetName: replicaSetName.orElse('unset'),
              time: now
            })
            setCallMetadata(Object.assign([], callMetadata))
            if (now.diff(lastFactUpdate, 'seconds') > 10) {
              setFactOfTheMoment(res.fact)
              setLastFactUpdate(now)
            }
          },
          () => {
            replicaSetName.ifPresent((name) => {
              callMetadata.push({
                succeeded: false,
                replicaSetName: name,
                time: now
              })
              setCallMetadata(Object.assign([], callMetadata))
            })
          }
        )
      })
    }, pollRate)

    return () => {
      clearInterval(factPoller)
    }
  }, [setFactOfTheMoment, pollRate, factOfTheMoment, setLastFactUpdate, lastFactUpdate, callMetadata, setCallMetadata])

  document.body.style.backgroundColor = '#39546A'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          padding: '25px',
          maxWidth: '1200px',
          width: '100%'
        }}
      >
        <SimpleGrid cols={1}>
          <FactOfTheMoment fact={factOfTheMoment} />
          {renderIfOrElse(isSmallScreen, <SmallScreenLayout callMetadata={callMetadata} />, <LargeScreenLayout callMetadata={callMetadata} />)}
        </SimpleGrid>
      </div>
    </div>
  )
}

export default App
