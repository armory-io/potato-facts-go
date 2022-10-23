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

package contoller

import (
	"context"
	"github.com/armory-io/go-commons/metadata"
	"github.com/armory-io/go-commons/server"
	"github.com/armory-io/go-commons/server/serr"
	"github.com/armory-io/potato-facts/internal/potatofacts/service"
	"go.uber.org/zap"
	"math/rand"
	"net/http"
	"time"
)

func NewPotatoFactController(
	log *zap.SugaredLogger,
	p4o *service.PotatoFactsSvc,
	app metadata.ApplicationMetadata,
) server.Controller {
	return server.Controller{
		Controller: &PotatoFactsController{
			log: log,
			p4o: p4o,
			app: app,
		},
	}
}

type PotatoFactsController struct {
	log *zap.SugaredLogger
	p4o *service.PotatoFactsSvc
	app metadata.ApplicationMetadata
}

func (p *PotatoFactsController) Handlers() []server.Handler {
	return []server.Handler{
		server.NewHandler(p.factsHandler, server.HandlerConfig{
			Method:     http.MethodGet,
			Path:       "/potato-fact",
			AuthOptOut: true,
		}),
	}
}

type PotatoFact struct {
	Fact string `json:"fact"`
}

func (p *PotatoFactsController) factsHandler(ctx context.Context, _ server.Void) (*server.Response[PotatoFact], serr.Error) {
	rand.Seed(time.Now().Unix())
	return &server.Response[PotatoFact]{
		Body: PotatoFact{Fact: p.p4o.GetFact()},
		Headers: map[string][]string{
			"X-Armory-Deployment-ID": {p.app.DeploymentId},
		},
	}, nil
}
