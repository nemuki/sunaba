package dev.nemuki.spring.grpc.kotlin.sample

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.grpc.server.GlobalServerInterceptor
import org.springframework.grpc.server.security.AuthenticationProcessInterceptor
import org.springframework.grpc.server.security.GrpcSecurity
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.web.server.adapter.WebHttpHandlerBuilder.applicationContext


@SpringBootApplication
@Import(AuthenticationConfiguration::class)
class SpringGrpcKotlinSampleApplication

fun main(args: Array<String>) {
    runApplication<SpringGrpcKotlinSampleApplication>(*args)
}

@Bean
@GlobalServerInterceptor
@Throws(Exception::class)
fun jwtSecurityFilterChain(grpc: GrpcSecurity): AuthenticationProcessInterceptor {
    println("jwtSecurityFilterChain")

    return grpc
        .authorizeRequests {
            it
                .allRequests()
                .permitAll()
        }
        .oauth2ResourceServer { it.jwt(withDefaults()) }
        .build()
}
