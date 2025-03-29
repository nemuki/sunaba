package dev.nemuki.spring.grpc.kotlin.sample

import io.grpc.stub.StreamObserver
import org.slf4j.LoggerFactory
import org.springframework.grpc.sample.proto.HelloReply
import org.springframework.grpc.sample.proto.HelloRequest
import org.springframework.grpc.sample.proto.SimpleGrpc
import org.springframework.stereotype.Controller

@Controller
class HelloController : SimpleGrpc.SimpleImplBase() {

    override fun sayHello(request: HelloRequest?, responseObserver: StreamObserver<HelloReply?>?) {
        logger.info("Hello ${request?.name}")

        val reply = HelloReply.newBuilder()
            .setMessage("Hello ${request?.name}")
            .build()

        responseObserver?.onNext(reply)
        responseObserver?.onCompleted()
    }

    companion object {
        val logger = LoggerFactory.getLogger(HelloController::class.java)
    }
}
