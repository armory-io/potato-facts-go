/*
 * Copyright 2022 Armory, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"go.uber.org/zap"
	"math/rand"
)

type PotatoFactsSvc struct {
	logger *zap.SugaredLogger
}

var potatoFacts = []string{
	"A potato is about 80% water and 20% solid.",
	"Henry Spalding first planted potatoes in Idaho in 1837",
	"“French Fries” were introduced to America when Thomas Jefferson served them at a White House dinner.",
	"American potato lovers consumed more than 4 million tons of French Fries in various shapes and sizes in 2017.",
	"Potatoes are a powerful aphrodisiac, says a physician in Ireland.",
	"The average American eats 140 pounds of potatoes per year. Germans eat more than 200 pounds per year.",
	"The largest potato grown was 18 pounds and 4 ounces according to the Guinness Book of World Records. It was grown in England in 1795.",
	"Potatoes are the world’s fourth food staple – after wheat, corn and rice.",
	"Potatoes are grown in more than 125 countries.",
	"Every year enough potatoes are grown worldwide to cover a four-lane motorway circling the world six times.",
	"China is the world’s largest potato producer.",
	"Potatoes were the first vegetable grown in space.",
	"Potatoes are totally gluten-free.",
	"One of the most basic Incan measurements of time was the time it took to cook a potato.",
	"If a potato is exposed to light while growing, it will turn green and become poisonous.",
	"It takes 10,000 pounds of potatoes to make 2,500 pounds of potato chips.",
	"Today there are more than 4000 different kinds of potatoes.",
	"Potatoes belong to a small family, the Nightshade or Solanaceae family.",
	"During the Alaskan Klondike gold rush, (1897-1898) potatoes were practically worth their weight in gold.",
	"Sir Walter Raleigh introduced potatoes to Ireland in 1589 on the 40,000 acres of land near Cork.",
	"Potatoes are available year-round as they are harvested somewhere every month of the year.",
	"Native to Africa and Asia, yams vary in size from the size of a small potato up to the record size of 130 pounds.",
	"August 19th and October 27th are National Potato Day.",
	"Potatoes are also used to brew alcoholic beverages such as vodka, potcheen, or akvavit.",
	"Potatoes are among the most environmentally friendly vegetables. They’re easy to grow, and don’t require massive amounts of fertilizer and chemical additives to thrive like many other vegetables do.",
	"The potato originated in the region of southern Peru where it was first domesticated between 8000 BC and 5000 BC.",
	"The word potato comes from the Spanish word patata.",
	"Potato plants are usually pollinated by insects such as bumblebees.",
	"A sweet potato isn’t actually a potato, they belong to the morning glory family (also known as the convolvulaceae family) and are actually swollen roots.",
}

func PotatoFactsSvcProvider(logger *zap.SugaredLogger) *PotatoFactsSvc {
	logger.Infof("Loaded %d facts", len(potatoFacts))
	return &PotatoFactsSvc{
		logger: logger,
	}
}

func (p *PotatoFactsSvc) GetFact() string {
	return (potatoFacts)[rand.Intn(len(potatoFacts))]
}
