import graphene
from .schemas.queries import Query
from .schemas.mutations import Mutation  # Import the complete Mutation class

# Remove the duplicate Mutation class definition and use the one from mutations.py
schema = graphene.Schema(query=Query, mutation=Mutation)