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

package config

import (
	"github.com/armory-io/go-commons/iam"
	"github.com/armory-io/go-commons/metrics"
	"github.com/armory-io/go-commons/server"
	"github.com/armory-io/go-commons/tracing"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		ConfigurationProvider,
		func(configuration *Configuration) Configuration {
			return *configuration
		},
		func(configuration Configuration) iam.Configuration {
			return configuration.Auth
		},
		func(configuration Configuration) server.Configuration {
			return configuration.Server
		},
		func(configuration Configuration) metrics.Configuration {
			return configuration.Metrics
		},
		func(configuration Configuration) tracing.Configuration {
			return configuration.Tracing
		},
	),
)
