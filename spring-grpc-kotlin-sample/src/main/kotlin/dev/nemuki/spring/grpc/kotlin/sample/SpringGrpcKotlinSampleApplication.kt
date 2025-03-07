package dev.nemuki.spring.grpc.kotlin.sample

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SpringGrpcKotlinSampleApplication

fun main(args: Array<String>) {
    runApplication<SpringGrpcKotlinSampleApplication>(*args)
}
