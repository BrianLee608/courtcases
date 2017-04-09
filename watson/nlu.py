from watson_developer_cloud import NaturalLanguageUnderstandingV1
import watson_developer_cloud.natural_language_understanding.features.v1 as \
    features

nlu = NaturalLanguageUnderstandingV1(
    version='2017-02-27',
    username='2564eab6-0669-4dfc-bc43-28d58851dc37',
    password='KaCShQkOtmMe')

def analyze(html): 
    response = nlu.analyze(
        html=html,
        features=[
            # features.Keywords(limit=32)
            features.Concepts(limit=32)
            # features.Entities(limit=32)
        ],
    )
    return response

