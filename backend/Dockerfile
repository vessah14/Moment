FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/src/backend_EventMoment/backend_EventMoment.csproj backend/src/backend_EventMoment/
RUN dotnet restore backend/src/backend_EventMoment/backend_EventMoment.csproj
COPY backend/src/backend_EventMoment/ backend/src/backend_EventMoment/
RUN dotnet publish backend/src/backend_EventMoment/backend_EventMoment.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5146
COPY --from=build /app/publish .
EXPOSE 5146
ENTRYPOINT ["dotnet", "backend_EventMoment.dll"]
