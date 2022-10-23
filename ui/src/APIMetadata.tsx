import { Card, Skeleton } from '@mantine/core'
import { Bar } from 'react-chartjs-2'
import { ApiCallMetadata } from './App'
import dayjs, { Dayjs } from 'dayjs'
import { Optional } from 'typescript-optional'
import { useEffect, useState } from 'react'

const { ofNullable, of } = Optional

interface APIMetadataProps {
  callMetadata: ApiCallMetadata[]
}

// TODO add debounce 5 seconds

interface Data {
  label: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
  data: number[]
}

const colors = ['#4ac1e0', '#37C666', '#FAB500', '#BC002E', '#1F1F1F']

const numberOfBuckets = 10

const bucketCalls = (callMetadata: ApiCallMetadata[]) => {
  const now = dayjs().set('seconds', 0).set('milliseconds', 0)
  const tenMinutesAgo = now.subtract(10, 'minutes')
  const bucketedCallCountsByDeployment: {
    [deploymentId: string]: number[]
  } = {}

  callMetadata.forEach((call) => {
    if (call.time.isBefore(tenMinutesAgo)) {
      return
    }
    const deploymentId = call.deploymentId
    const i = calcBucketIndex(call.time, now, tenMinutesAgo)

    ofNullable(bucketedCallCountsByDeployment[deploymentId]).ifPresentOrElse(
      (data) => {
        data[i]++
      },
      () => {
        const data = new Array(numberOfBuckets).fill(0)
        data[i] = 1
        bucketedCallCountsByDeployment[deploymentId] = data
      }
    )
  })
  return bucketedCallCountsByDeployment
}

const calcBucketIndex = (date: Dayjs, now: Dayjs, tenMinutesAgo: Dayjs): number => {
  const thenNowDiff = now.diff(tenMinutesAgo, 'seconds')
  const interval = thenNowDiff / numberOfBuckets
  const nowCallDiff = date.diff(tenMinutesAgo, 'seconds')
  const i = Math.floor(nowCallDiff / interval)
  return i - 1
}

const calcBucketSums = (deployments: string[], bucketedCalls: { [p: string]: number[] }) => {
  const bucketSums = new Array(numberOfBuckets).fill(0)
  deployments.forEach((deployment) => {
    for (let i = 0; i < numberOfBuckets; i++) {
      bucketSums[i] += bucketedCalls[deployment][i]
    }
  })
  return bucketSums
}

export const APIMetadata = ({ callMetadata }: APIMetadataProps) => {
  const [colorDict, setColorDict] = useState<{ [deploymentId: string]: string }>({})
  const [data, setData] = useState<Data[]>([])

  useEffect(() => {
    if (callMetadata.length < 2) {
      return
    }
    let dict = Object.assign({}, colorDict)

    const bucketedCalls = bucketCalls(callMetadata)
    const deployments = Object.keys(bucketedCalls)
    const bucketSums = calcBucketSums(deployments, bucketedCalls)

    const chartData: Data[] = []
    deployments.forEach((deploymentId) => {
      const data: number[] = new Array(numberOfBuckets).fill(0)
      for (let i = 0; i < numberOfBuckets; i++) {
        data[i] = bucketedCalls[deploymentId][i] / bucketSums[i]
      }

      const color = ofNullable(colorDict[deploymentId])
        .or(() => {
          let colorToUse = colors[0]
          let foundMatch = false
          for (const c of colors) {
            if (foundMatch) break
            for (const key of Object.keys(colorDict)) {
              const value = colorDict[key]
              const res = c !== value
              if (res) {
                colorToUse = c
                foundMatch = true
                break
              }
            }
          }
          const update: { [k: string]: string } = {}
          update[deploymentId] = colorToUse
          dict = Object.assign({}, dict, update)
          return of(colorToUse)
        })
        .orElseThrow(() => new Error('something bad happened'))

      chartData.push({
        label: deploymentId,
        backgroundColor: color,
        borderColor: 'black',
        borderWidth: 1,
        data: data
      })
    })

    setColorDict(dict)
    setData(chartData)
  }, [callMetadata])

  if (callMetadata.length < 2) {
    return (
      <Skeleton visible={true}>
        <div
          style={{
            display: 'block',
            minHeight: '300px'
          }}
        ></div>
      </Skeleton>
    )
  }

  return (
    <Card>
      <Bar
        height={'250px'}
        updateMode={'resize'}
        options={{
          plugins: {
            title: {
              display: true,
              text: `Traffic Split 10 Minute Rolling Window`,
              color: 'black',
              font: {
                weight: 'bold',
                size: 17
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 1,
              suggestedMin: 0,
              stacked: true,
              ticks: {
                callback: (value) => `${parseFloat(`${value}`) * 100}%`
              }
            },
            x: {
              stacked: true
            }
          }
        }}
        data={{
          labels: ['-10m', '-9m', '-8m', '-7m', '-6m', '-5m', '-4m', '-3m', '-2m', '-1m'],
          datasets: data
        }}
      />
    </Card>
  )
}
