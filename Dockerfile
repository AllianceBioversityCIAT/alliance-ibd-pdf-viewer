# Dockerfile for ECR deployment (Next.js Standalone)
# This is used when the package size exceeds ZIP limits or ECR is explicitly requested

FROM public.ecr.aws/lambda/nodejs:20

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy Next.js standalone server
# The standalone output contains server.js and all dependencies
# Preserve the .next/standalone structure for handler compatibility
COPY .next/standalone ./.next/standalone

# Copy Next.js static assets (required for serving static files)
COPY .next/static ./.next/static

# Copy public directory (if it exists)
COPY public ./public

# Copy Lambda handler
COPY lambda/handler.mjs ./

# Create index.mjs fallback (for Lambda compatibility)
RUN echo "export { handler } from './handler.mjs';" > index.mjs

# Set handler
CMD [ "handler.handler" ]
