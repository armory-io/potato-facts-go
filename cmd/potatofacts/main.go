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

package main

import (
	"context"
	"embed"
	"github.com/armory-io/go-commons/iam"
	"github.com/armory-io/go-commons/logging"
	"github.com/armory-io/go-commons/management"
	"github.com/armory-io/go-commons/management/info"
	"github.com/armory-io/go-commons/metadata"
	"github.com/armory-io/go-commons/metrics"
	"github.com/armory-io/go-commons/server"
	"github.com/armory-io/go-commons/tracing"
	"github.com/armory-io/potato-facts/internal/potatofacts"
	"go.uber.org/fx"
	"os"
	"os/signal"
	"syscall"
	"time"
)

//go:embed resources/*
var resources embed.FS

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	app := fx.New(
		fx.StartTimeout(30*time.Second),
		fx.Provide(
			// Embedded resources provider
			func() embed.FS { return resources },
			// Base app context provider
			func() context.Context { return ctx },
		),
		logging.Module,
		metadata.Module,
		server.Module,
		management.Module,
		tracing.Module,
		fx.Provide(
			metrics.New,
			iam.New,
			info.New,
			func() server.AuthService {
				return server.NewNoopAuthService()
			},
		),
		potatofacts.Module,
	)
	app.Run()
}
